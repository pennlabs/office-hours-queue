from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester
from ohq.permissions import (
    CoursePermission,
    IsSuperuser,
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
    queryset = get_user_model().objects.none()

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
