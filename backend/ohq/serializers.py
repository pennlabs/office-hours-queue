from django.contrib.auth import get_user_model
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers

from ohq.models import Course, Membership, MembershipInvite, Profile, Question, Queue, Semester


class CourseRouteMixin(serializers.ModelSerializer):
    """
    Mixin for serializers that overrides the save method to
    properly handle the URL parameter for courses.
    """

    def save(self):
        self.validated_data["course"] = Course.objects.get(
            pk=self.context["view"].kwargs["course_pk"]
        )
        return super().save()


class QueueRouteMixin(serializers.ModelSerializer):
    """
    Mixin for serializers that overrides the save method to
    properly handle the URL parameter for queues.
    """

    def save(self):
        self.validated_data["queue"] = Queue.objects.get(pk=self.context["view"].kwargs["queue_pk"])
        return super().save()


class ProfileSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField()

    class Meta:
        model = Profile
        fields = ("sms_notifications_enabled", "phone_number")


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=False)

    class Meta:
        model = get_user_model()
        fields = ("first_name", "last_name", "email", "profile")

    # TODO: need to add logic to update profile from here


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ("year", "term")


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = (
            "id",
            "course_code",
            "department",
            "course_title",
            "description",
            "semester",
            "archived",
            "invite_only",
            "video_chat_enabled",
            "require_video_chat_url_on_questions",
            # "members",
        )


class MembershipSerializer(CourseRouteMixin):
    class Meta:
        model = Membership
        fields = ("kind", "time_created", "last_active")
        # TODO: make different serializers for membership
        # for within a user's profile (private to them)


class MembershipInviteSerializer(CourseRouteMixin):
    class Meta:
        model = MembershipInvite
        fields = ("email", "kind", "time_created")


class QueueSerializer(CourseRouteMixin):
    class Meta:
        model = Queue
        fields = (
            "id",
            "name",
            "description",
            "archived",
            "estimated_wait_time",
            "active",
            "active_override_time",
        )


class QuestionSerializer(QueueRouteMixin):
    class Meta:
        model = Question
        fields = (
            "text",
            "video_chat_url",
            "time_asked",
            "asked_by",
            "time_last_updated",
            "time_withdrawn",
            "time_rejected",
            "rejected_by",
            "rejected_reason",
            "rejected_reason_other",
            "time_started",
            "time_answered",
            "answered_by",
            "should_send_up_soon_notification",
        )
        # TODO: restrict what fields students/TAs can modify
