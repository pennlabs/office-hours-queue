import re

from django.contrib.auth import get_user_model
from django.core.validators import ValidationError, validate_email
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester
from ohq.permissions import (
    CoursePermission,
    IsSuperuser,
    MassInvitePermission,
    MembershipInvitePermission,
    MembershipPermission,
    QuestionPermission,
    QueuePermission,
)
from ohq.serializers import (
    CourseSerializer,
    MembershipInviteSerializer,
    MembershipSerializer,
    QuestionSerializer,
    QueueSerializer,
    SemesterSerializer,
    UserPrivateSerializer,
)


User = get_user_model()


class UserViews(generics.RetrieveUpdateAPIView):
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

    def get_queryset(self):
        return Course.objects.filter(membership__user=self.request.user)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single question with all information fields present.

    list:
    Return a list of questions specific to a queue.

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
        return Question.objects.filter(queue=self.kwargs["queue_pk"])


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
        return Queue.objects.filter(course=self.kwargs["course_pk"])


class MembershipViewSet(viewsets.ModelViewSet):
    """
    retrieve:
    Return a single membership.

    list:
    Return a list of memberships specific to a course.

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
        return Membership.objects.filter(course=self.kwargs["course_pk"])


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
