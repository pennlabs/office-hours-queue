import re
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.validators import ValidationError, validate_email
from django.db.models import Count, Exists, FloatField, IntegerField, OuterRef, Q, Subquery
from django.http import HttpResponseBadRequest, JsonResponse
from django.utils import timezone
from django.utils.crypto import get_random_string
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ohq.filters import QuestionSearchFilter
from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester
from ohq.pagination import QuestionSearchPagination
from ohq.permissions import (
    CoursePermission,
    IsSuperuser,
    MassInvitePermission,
    MembershipInvitePermission,
    MembershipPermission,
    QuestionPermission,
    QuestionSearchPermission,
    QueuePermission,
)
from ohq.schemas import MassInviteSchema
from ohq.serializers import (
    CourseCreateSerializer,
    CourseSerializer,
    MembershipInviteSerializer,
    MembershipSerializer,
    Profile,
    QuestionSerializer,
    QueueSerializer,
    SemesterSerializer,
    UserPrivateSerializer,
)
from ohq.sms import sendSMSVerification


User = get_user_model()


class UserView(generics.RetrieveUpdateAPIView):
    """
    get:
    Return information about the logged in user.

    update:
    Update information about the logged in user.
    You must specify all of the fields or use a patch request.

    patch:
    Update information about the logged in user.
    Only updates fields that are passed to the server.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserPrivateSerializer

    def get_object(self):
        return self.request.user


class ResendNotificationView(generics.CreateAPIView):
    """
    update:
    Generate and send a new SMS verification if the current one
    has expired
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserPrivateSerializer

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        user = self.get_object()
        elapsed_time = timezone.now() - user.profile.sms_verification_timestamp
        if elapsed_time.total_seconds() > Profile.SMS_VERIFICATION_EXPIRATION_MINUTES * 60:
            user.profile.sms_verification_code = get_random_string(
                length=6, allowed_chars="1234567890"
            )
            user.profile.sms_verification_timestamp = timezone.now()
            sendSMSVerification(user.profile.phone_number, user.profile.sms_verification_code)
            user.save()
            return JsonResponse({"detail": "success"})
        return HttpResponseBadRequest()


class CourseViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single course with all information fields present.

    list:
    Return a list of courses with partial information for each course.

    create:
    Create a course.

    update:
    Update all fields in the course.
    You must specify all of the fields or use a patch request.

    partial_update:
    Update certain fields in the course.
    Only specify the fields that you want to change.

    destroy:
    Delete a course. Consider marking the course as archived instead of deleting the course.
    """

    permission_classes = [CoursePermission | IsSuperuser]
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["course_code", "department"]

    def get_serializer_class(self):
        if self.action == "create":
            return CourseCreateSerializer
        return self.serializer_class

    def get_queryset(self):
        is_member = Membership.objects.filter(course=OuterRef("pk"), user=self.request.user)
        return (
            Course.objects.filter(Q(invite_only=False) | Q(membership__user=self.request.user))
            .distinct()
            .annotate(is_member=Exists(is_member))
        )


class QuestionViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single question with all information fields present.

    list:
    Return a list of questions specific to a queue.
    Students can only see questions they submitted.

    create:
    Create a question.

    update:
    Update all fields in the question.
    You must specify all of the fields or use a patch request.

    partial_update:
    Update certain fields in the question.
    Only specify the fields that you want to change.

    destroy:
    Delete a question.
    """

    permission_classes = [QuestionPermission | IsSuperuser]
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = Question.objects.filter(
            Q(queue=self.kwargs["queue_pk"])
            & (Q(status=Question.STATUS_ASKED) | Q(status=Question.STATUS_ACTIVE))
        ).order_by("time_asked")

        membership = Membership.objects.get(course=self.kwargs["course_pk"], user=self.request.user)

        if not membership.is_ta:
            qs = qs.filter(asked_by=self.request.user)
        return qs

    @action(detail=True)
    def position(self, request, course_pk, queue_pk, pk=None):
        """
        Get the position of a question within its queue.
        """
        question = self.get_object()
        position = -1
        if question.status == Question.STATUS_ASKED:
            position = (
                Question.objects.filter(
                    queue=queue_pk, status=Question.STATUS_ASKED, time_asked__lt=question.time_asked
                ).count()
                + 1
            )
        return JsonResponse({"position": position})

    def list(self, request, *args, **kwargs):
        """
        Update a staff member's last active time when they view questions
        """

        membership = Membership.objects.get(user=request.user, course=self.kwargs["course_pk"])
        membership.last_active = timezone.now()
        membership.save()
        return super().list(request, *args, **kwargs)


class QuestionSearchView(generics.ListAPIView):
    filter_backends = [DjangoFilterBackend]
    filterset_class = QuestionSearchFilter
    pagination_class = QuestionSearchPagination
    permission_classes = [QuestionSearchPermission | IsSuperuser]
    serializer_class = QuestionSerializer

    def get_queryset(self):
        return Question.objects.filter(
            queue__in=Queue.objects.filter(course=self.kwargs["course_pk"])
        ).order_by("time_asked")


class QueueViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single queue.

    list:
    Return a list of queues specific to a course.

    create:
    Create a queue.

    update:
    Update all fields in the queue.
    You must specify all of the fields or use a patch request.

    partial_update:
    Update certain fields in the queue.
    Only specify the fields that you want to change.

    destroy:
    Delete a queue.
    """

    permission_classes = [QueuePermission | IsSuperuser]
    serializer_class = QueueSerializer

    def get_queryset(self):
        """
        Annotate the number of questions asked, number of questioned currently being answered,
        and the number of active staff members.
        Filter/annotation pattern taken from here:
        https://stackoverflow.com/questions/42543978/django-1-11-annotating-a-subquery-aggregate
        """

        questions = (
            Question.objects.filter(queue=OuterRef("pk"))
            .order_by()
            .values("queue")
            .annotate(count=Count("*"))
            .values("count")
        )
        questions_active = questions.filter(status=Question.STATUS_ACTIVE)
        questions_asked = questions.filter(status=Question.STATUS_ASKED)

        time_threshold = timezone.now() - timedelta(minutes=1)
        staff_active = (
            Membership.objects.filter(
                Q(course=OuterRef("course__pk"))
                & ~Q(kind=Membership.KIND_STUDENT)
                & Q(last_active__gt=time_threshold)
            )
            .order_by()
            .values("course")
            .annotate(count=Count("*", output_field=FloatField()),)
            .values("count")
        )

        return (
            Queue.objects.filter(course=self.kwargs["course_pk"], archived=False)
            .annotate(
                questions_active=Subquery(questions_active[:1], output_field=IntegerField()),
                questions_asked=Subquery(questions_asked[:1]),
                staff_active=Subquery(staff_active[:1]),
            )
            .order_by("id")
        )

    @action(methods=["POST"], detail=True)
    def clear(self, request, course_pk, pk=None):
        """
        Clear the queue by rejecting all questions which are currently open (in the asked state).
        """
        queue = self.get_object()
        Question.objects.filter(queue=queue, status=Question.STATUS_ASKED).update(
            status=Question.STATUS_REJECTED,
            rejected_reason="OH_ENDED",
            responded_to_by=self.request.user,
        )
        return JsonResponse({"detail": "success"})


class MembershipViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single membership.

    list:
    Return a list of memberships specific to a course. Students cannot see
    if peers are members or not.

    create:
    Create a membership.

    update:
    Update all fields in the membership.
    You must specify all of the fields or use a patch request.

    partial_update:
    Update certain fields in the membership.
    Only specify the fields that you want to change.

    destroy:
    Delete a membership.
    """

    permission_classes = [MembershipPermission | IsSuperuser]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        qs = Membership.objects.filter(course=self.kwargs["course_pk"])

        membership = Membership.objects.get(course=self.kwargs["course_pk"], user=self.request.user)

        if not membership.is_ta:
            qs = qs.filter(
                Q(kind=Membership.KIND_PROFESSOR)
                | Q(kind=Membership.KIND_HEAD_TA)
                | Q(user=self.request.user)
            )
        return qs.order_by("user__first_name")


class MembershipInviteViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single membership invite.

    list:
    Return a list of membership invites specific to a course.

    create:
    Create a membership invite.

    update:
    Update all fields in the membership invite.
    You must specify all of the fields or use a patch request.

    partial_update:
    Update certain fields in the membership invite.
    Only specify the fields that you want to change.

    destroy:
    Delete a membership invite.
    """

    permission_classes = [MembershipInvitePermission | IsSuperuser]
    serializer_class = MembershipInviteSerializer

    def get_queryset(self):
        return MembershipInvite.objects.filter(course=self.kwargs["course_pk"])


class SemesterViewSet(viewsets.ReadOnlyModelViewSet):
    """
    list:
    Get all semesters

    retrieve:
    Get a specific semester
    """

    serializer_class = SemesterSerializer
    queryset = Semester.objects.all()


class MassInviteView(APIView):
    """
    Sends out invitations to join a course to multiple recipients.
    """

    permission_classes = [MassInvitePermission | IsSuperuser]
    schema = MassInviteSchema()

    def post(self, request, course_pk, format=None):
        kind = request.data.get("kind")
        course = Course.objects.get(id=self.kwargs["course_pk"])
        # Get list of emails
        emails = [x.strip() for x in re.split("\n|,", request.data.get("emails", ""))]
        emails = [x for x in emails if x]

        # Validate emails
        try:
            for email in emails:
                validate_email(email)
        except ValidationError:
            return Response({"detail": "invalid emails"}, status=400)
        # Remove invitees already in class
        existing = Membership.objects.filter(course=course, user__email__in=emails).values_list(
            "user__email", flat=True
        )
        emails = list(set(emails) - set(existing))

        # Remove invitees already sent an invite
        existing = MembershipInvite.objects.filter(course=course, email__in=emails).values_list(
            "email", flat=True
        )
        emails = list(set(emails) - set(existing))

        # Directly add invitees with existing accounts
        users = User.objects.filter(email__in=emails)
        for user in users:
            membership = Membership.objects.create(course=course, user=user, kind=kind)
            membership.send_email()

        # Create membership invites for invitees without an account
        emails = list(set(emails) - set(users.values_list("email", flat=True)))
        for email in emails:
            invite = MembershipInvite.objects.create(email=email, course=course, kind=kind)
            invite.send_email()

        return Response(
            data={"detail": "success", "members_added": len(users), "invites_sent": len(emails)},
            status=201,
        )
