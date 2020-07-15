from django.conf import settings
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.dispatch import receiver
from phonenumber_field.modelfields import PhoneNumberField


User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    """
    An extension to a User object that includes additional information.
    """

    preferred_name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    sms_notifications_enabled = models.BooleanField(default=False)
    sms_verification_code = models.CharField(max_length=6, blank=True, null=True)
    sms_verification_timestamp = models.DateTimeField(blank=True, null=True)
    sms_verified = models.BooleanField(default=False)
    phone_number = PhoneNumberField(blank=True, null=True)

    # SMS_VERIFICATION_EXPIRATION_MINUTES = 15

    def __str__(self):
        return str(self.user)


@receiver(models.signals.post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    Profile.objects.get_or_create(user=instance)
    instance.profile.save()


class Semester(models.Model):
    """
    A semester used to indicate when questions were used.
    Contains a year and season.
    """

    TERM_SPRING = "SPRING"
    TERM_SUMMER = "SUMMER"
    TERM_FALL = "FALL"
    TERM_WINTER = "WINTER"
    TERM_CHOICES = [
        (TERM_SPRING, "Spring"),
        (TERM_SUMMER, "Summer"),
        (TERM_FALL, "Fall"),
        (TERM_WINTER, "Winter"),
    ]
    year = models.IntegerField()
    term = models.CharField(max_length=6, choices=TERM_CHOICES, default=TERM_FALL)

    def term_to_pretty(self):
        return self.term.title()

    def __str__(self):
        return f"{self.year} - {self.term_to_pretty()}"


class Course(models.Model):
    """
    A course taught in a specific semester.
    """

    course_code = models.CharField(max_length=10)
    department = models.CharField(max_length=10)
    course_title = models.CharField(max_length=50)
    description = models.CharField(max_length=255, blank=True)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    archived = models.BooleanField(default=False)
    invite_only = models.BooleanField(default=False)
    video_chat_enabled = models.BooleanField(default=False)
    require_video_chat_url_on_questions = models.BooleanField(default=False)
    members = models.ManyToManyField(User, through="Membership", through_fields=("course", "user"))

    # MAX_NUMBER_COURSE_USERS = 1000

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course_code", "department", "semester"], name="unique_course_name"
            )
        ]

    # @property
    # def student_users(self):
    #     return self.course_users.filter(kind=CourseUserKind.STUDENT.name)

    # @property
    # def ta_users(self):
    #     return self.course_users.filter(kind=CourseUserKind.TA.name)

    # @property
    # def head_ta_users(self):
    #     return self.course_users.filter(kind=CourseUserKind.HEAD_TA.name)

    # @property
    # def professor_users(self):
    #     return self.course_users.filter(kind=CourseUserKind.PROFESSOR.name)

    # @property
    # def formatted_course_code(self):
    #     return f"{self.department} {self.course_code}"

    def __str__(self):
        return f"{self.department} {self.course_code}: {str(self.semester)}"


class Membership(models.Model):
    """
    Represents a relationship between a user and a course.
    """

    KIND_STUDENT = "STUDENT"
    KIND_TA = "TA"
    KIND_HEAD_TA = "HEAD_TA"
    KIND_PROFESSOR = "PROFESSOR"
    KIND_CHOICES = [
        (KIND_STUDENT, "Student"),
        (KIND_TA, "TA"),
        (KIND_HEAD_TA, "Head TA"),
        (KIND_PROFESSOR, "Professor"),
    ]
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    kind = models.CharField(max_length=9, choices=KIND_CHOICES, default=KIND_STUDENT)
    deactivated = models.BooleanField(default=False)
    time_created = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(
        User, related_name="invited_memberships", on_delete=models.SET_NULL, blank=True, null=True
    )

    # For staff
    last_active = models.DateTimeField(blank=True, null=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["course", "user"], name="unique_membership")]

    def kind_to_pretty(self):
        return [pretty for raw, pretty in self.KIND_CHOICES if raw == self.kind][0]

    def __str__(self):
        return f"<Membership: {self.user} - {self.course} ({self.kind_to_pretty()})>"


class MembershipInvite(models.Model):
    """
    Represents an invitation to a course.
    """

    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    email = models.EmailField()
    kind = models.CharField(
        max_length=9, choices=Membership.KIND_CHOICES, default=Membership.KIND_STUDENT
    )
    time_created = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["course", "email"], name="unique_invited_course_user")
        ]

    def __str__(self):
        return f"<MembershipInvite: {self.course} - {self.email}>"

    # TODO: claim + sendemail


class Queue(models.Model):
    """
    A single office hours queue for a class.
    """

    name = models.CharField(max_length=255)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    archived = models.BooleanField(default=False)

    estimated_wait_time = models.IntegerField(default=0)
    start_end_times = JSONField()

    active_override_time = models.DateTimeField(blank=True, null=True)

    # MAX_NUMBER_QUEUES = 2

    def is_active(self):
        # TODO: ?
        return None

    class Meta:
        constraints = [models.UniqueConstraint(fields=["course", "name"], name="unique_queue_name")]

    def __str__(self):
        return f"{self.course}: {self.name}"


class Question(models.Model):
    """
    A question asked within a queue.
    """

    # TODO: save status?
    text = models.TextField()
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE)
    video_chat_url = models.URLField(blank=True, null=True)

    time_asked = models.DateTimeField(auto_now_add=True)
    asked_by = models.ForeignKey(
        User, related_name="asked_questions", on_delete=models.SET_NULL, blank=True, null=True
    )

    # TODO: clean this up
    time_last_updated = models.DateTimeField(blank=True, null=True)
    time_withdrawn = models.DateTimeField(blank=True, null=True)

    time_rejected = models.DateTimeField(blank=True, null=True)
    rejected_by = models.ForeignKey(
        User, related_name="rejected_questions", on_delete=models.SET_NULL, blank=True, null=True
    )
    rejected_reason = models.CharField(max_length=20, blank=True, null=True)
    rejected_reason_other = models.CharField(max_length=200, blank=True, null=True)

    time_started = models.DateTimeField(blank=True, null=True)
    time_answered = models.DateTimeField(blank=True, null=True)
    answered_by = models.ForeignKey(
        User, related_name="answered_questions", on_delete=models.SET_NULL, blank=True, null=True
    )

    # order_key = models.IntegerField(default=0, editable=False)

    should_send_up_soon_notification = models.BooleanField(default=False)

    # @property
    # def state(self):
    #     if (
    #         self.time_started is None
    #         and self.time_answered is None
    #         and self.time_rejected is None
    #         and self.time_withdrawn is None
    #     ):
    #         return QuestionState.ACTIVE
    #     if self.time_answered is not None:
    #         return QuestionState.ANSWERED
    #     if self.time_started is not None:
    #         return QuestionState.STARTED
    #     if self.time_rejected is not None:
    #         return QuestionState.REJECTED
    #     if self.time_withdrawn is not None:
    #         return QuestionState.WITHDRAWN
    #     return None

    # def __str__(self):
    #     return f"{self.time_asked} - {self.queue.course} - {self.queue.name}"
