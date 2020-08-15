from rest_framework import permissions

from ohq.models import Course, Membership


# Hierarchy of permissions is usually:
# Professor > Head TA > TA > Student > User
# Anonymous Users can't do anything
# Note: everything other than IsSuperuser and CoursePermission is
# scoped to a specific course.


class IsSuperuser(permissions.BasePermission):
    """
    Grants permission if the current user is a superuser.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.is_superuser

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class CoursePermission(permissions.BasePermission):
    """
    Anyone can get or list courses.
    Only head TAs or professors should be able to modify a course.
    Current Head TAs+ or faculty members can create courses.
    No one can delete courses.
    """

    def has_object_permission(self, request, view, obj):
        membership = Membership.objects.filter(course=obj, user=request.user).first()

        # Non members can't do anything
        if membership is None:
            return False

        # Anyone can get a single course
        if view.action == "retrieve":
            return True

        # No one can delete a course
        if view.action == "destroy":
            return False

        # Course leadership can make changes
        if view.action in ["update", "partial_update"]:
            return membership.is_leadership

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        # Members can list courses
        if view.action == "list":
            return True

        # TODO: change custom DLA backend to save user groups
        if view.action == "create":
            return (
                request.user.groups.filter(name="faculty").exists()
                or Membership.objects.filter(
                    user=request.user, kind=Membership.KIND_HEAD_TA
                ).exists()
                or Membership.objects.filter(
                    user=request.user, kind=Membership.KIND_PROFESSOR
                ).exists()
            )

        return True


class QueuePermission(permissions.BasePermission):
    """
    TAs+ should be able to modify a course.
    Only head TAs or professors can create or delete queues.
    Students+ can get or list queues
    """

    def has_object_permission(self, request, view, obj):
        membership = Membership.objects.get(course=view.kwargs["course_pk"], user=request.user)

        # Students+ can get a single queue
        if view.action == "retrieve":
            return True

        # TAs+ can make changes
        if view.action in ["update", "partial_update"]:
            return membership.is_ta

        # Head TAs+ can create or delete a queue
        if view.action == "destroy":
            return membership.is_leadership

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        membership = Membership.objects.filter(
            course=view.kwargs["course_pk"], user=request.user
        ).first()

        # Non-Students can't do anything
        if membership is None:
            return False

        # TAs+ can make changes
        if view.action in ["update", "partial_update"]:
            return membership.is_ta

        # Head TAs+ can create or delete a queue
        if view.action == "create":
            return membership.is_leadership

        return True


class QuestionPermission(permissions.BasePermission):
    """
    Students can create questions
    Students can get or modify their own questions.
    TAs+ can list questions and modify any question.
    No one can delete questions.
    """

    def has_object_permission(self, request, view, obj):
        membership = Membership.objects.get(course=view.kwargs["course_pk"], user=request.user)

        # Students can get or modify their own question
        # TAs+ can get or modify any questions
        if view.action in ["retrieve", "update", "partial_update"]:
            return obj.asked_by is request.user or membership.is_ta

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        membership = Membership.objects.filter(
            course=view.kwargs["course_pk"], user=request.user
        ).first()

        # Non-Students can't do anything
        if membership is None:
            return False

        # No one can delete questions
        if view.action == "destroy":
            return False

        # Students can create questions:
        if view.action == "create":
            return membership.kind == Membership.KIND_STUDENT

        # TAs+ can list questions
        if view.action == "list":
            return membership.is_ta

        # Students+ can get or modify questions
        # With restrictions defined in has_object_permission
        return True


class MembershipPermission(permissions.BasePermission):
    """
    Students can get their own membership.
    TAs+ can list memberships.
    Users can create a Student membership with open courses.
    Head TAs+ can modify and delete memberships.
    Students can delete their own memberships.
    """

    def has_object_permission(self, request, view, obj):
        membership = Membership.objects.get(course=view.kwargs["course_pk"], user=request.user)

        # Students can get their own memberships
        # TAs+ can get any memberships
        if view.action == "retrieve":
            return obj.user is request.user or membership.is_ta

        # Students can delete their own memberships
        # Head TAs+ can delete any memberships
        # TODO: make sure Head TAs+ can't delete professors
        # and professors can't delete themselves
        if view.action == "destroy":
            return obj.user is request.user or membership.is_leadership

        # Head TAs+ can modify any membership
        # TODO: make sure Head TAs+ can't delete professors
        # and professors can't delete themselves
        if view.action in ["update", "partial_update"]:
            return membership.is_leadership

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        membership = Membership.objects.filter(
            course=view.kwargs["course_pk"], user=request.user
        ).first()

        # No one can create a membership
        if view.action == "create":
            course = Course.objects.get(id=view.kwargs["course_pk"])
            return membership is None and not course.invite_only

        # Non-Students can't do anything besides create a membership
        if membership is None:
            return False

        # TAs+ can list membership
        if view.action == "list":
            return membership.is_ta

        # Students+ can get, modify, and delete memberships
        # With restrictions defined in has_object_permission
        return True


class MembershipInvitePermission(permissions.BasePermission):
    """
    TAs+ can get and list membership invites.
    Head TAs+ can create, modify, and delete memberships.
    """

    def has_object_permission(self, request, view, obj):
        membership = Membership.objects.get(course=view.kwargs["course_pk"], user=request.user)

        # TAs+ can get any membership invite
        if view.action == "retrieve":
            return membership.is_ta

        # Head TAs+ can modify or delete any memberships
        if view.action in ["destroy", "update", "partial_update"]:
            return membership.is_leadership

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        membership = Membership.objects.filter(
            course=view.kwargs["course_pk"], user=request.user
        ).first()

        # Non-Students can't do anything
        if membership is None:
            return False

        # Head TAs+ can create membership invites
        if view.action == "create":
            return membership.is_leadership

        # TAs+ can list membership invites
        if view.action == "list":
            return membership.is_ta

        # TAs+ can get, modify, and delete memberships
        # With restrictions defined in has_object_permission
        return membership.is_ta


class MassInvitePermission(permissions.BasePermission):
    """
    Head TAs+ can create mass membership invites.
    """

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        membership = Membership.objects.filter(
            course=view.kwargs["course_pk"], user=request.user
        ).first()

        # Non-Students can't do anything
        if membership is None:
            return False

        return membership.is_leadership


class LeadershipPermission(permissions.BasePermission):
    """
    Students+ can see leadership for a course.
    """

    def has_permission(self, request, view):
        # Anonymous users can't do anything
        if not request.user.is_authenticated:
            return False

        membership = Membership.objects.filter(
            course=view.kwargs["course_pk"], user=request.user
        ).first()

        # Non-Students can't do anything
        return membership is not None
