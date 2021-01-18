from django.conf import settings
from django.db import models
from django.dispatch import receiver
from email_tools.emails import send_email
from phonenumber_field.modelfields import PhoneNumberField


User = settings.AUTH_USER_MODEL


class Profile(models.Model):
    """
    An extension to a User object that includes additional information.
    """

    # preferred_name = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    sms_notifications_enabled = models.BooleanField(default=False)
    sms_verification_code = models.CharField(max_length=6, blank=True, null=True)
    sms_verification_timestamp = models.DateTimeField(blank=True, null=True)
    sms_verified = models.BooleanField(default=False)
    phone_number = PhoneNumberField(blank=True, null=True)

    SMS_VERIFICATION_EXPIRATION_MINUTES = 10

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
        return f"{self.term_to_pretty()} {self.year}"


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
    time_created = models.DateTimeField(auto_now_add=True)

    # For staff
    last_active = models.DateTimeField(blank=True, null=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["course", "user"], name="unique_membership")]

    @property
    def is_leadership(self):
        return self.kind in [Membership.KIND_PROFESSOR, Membership.KIND_HEAD_TA]

    @property
    def is_ta(self):
        return self.is_leadership or self.kind == Membership.KIND_TA

    def kind_to_pretty(self):
        return [pretty for raw, pretty in self.KIND_CHOICES if raw == self.kind][0]

    def send_email(self):
        """
        Send the email associated with this invitation to the user.
        """

        context = {
            "course": f"{self.course.department} {self.course.course_code}",
            "role": self.kind_to_pretty(),
            "product_link": f"https://{settings.DOMAIN}",
        }
        subject = f"You've been added to {context['course']} OHQ"
        send_email("emails/course_added.html", context, subject, self.user.email)

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

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["course", "email"], name="unique_invited_course_user")
        ]

    def kind_to_pretty(self):
        return [pretty for raw, pretty in Membership.KIND_CHOICES if raw == self.kind][0]

    def send_email(self):
        """
        Send the email associated with this invitation to the user.
        """

        context = {
            "course": f"{self.course.department} {self.course.course_code}",
            "role": self.kind_to_pretty(),
            "product_link": f"https://{settings.DOMAIN}",
        }
        subject = f"Invitation to join {context['course']} OHQ"
        send_email("emails/course_invitation.html", context, subject, self.email)

    def __str__(self):
        return f"<MembershipInvite: {self.email} - {self.course} ({self.kind_to_pretty()})>"


class Queue(models.Model):
    """
    A single office hours queue for a class.
    """

    name = models.CharField(max_length=255)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    archived = models.BooleanField(default=False)

    # Estimated wait time for the queue, in minutes
    estimated_wait_time = models.IntegerField(default=-1)
    active = models.BooleanField(default=False)
    # TODO: re-add some sort of scheduling feature?

    # MAX_NUMBER_QUEUES = 2

    # particular user can ask rate_limit_questions in rate_limit_minutes if the queue length is
    # greater than rate_limit_length
    rate_limit_length = models.IntegerField(blank=True, null=True)
    rate_limit_questions = models.IntegerField(blank=True, null=True)
    rate_limit_minutes = models.IntegerField(blank=True, null=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["course", "name"], name="unique_queue_name")]

    def __str__(self):
        return f"{self.course}: {self.name}"


class Tag(models.Model):
    """
    Tags for a course.
    """

    name = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["name", "course"], name="unique_course_tag")]

    def __str__(self):
        return f"{self.course}: {self.name}"


class Question(models.Model):
    """
    A question asked within a queue.
    """

    STATUS_ASKED = "ASKED"
    STATUS_WITHDRAWN = "WITHDRAWN"
    STATUS_ACTIVE = "ACTIVE"
    STATUS_REJECTED = "REJECTED"
    STATUS_ANSWERED = "ANSWERED"
    STATUS_CHOICES = [
        (STATUS_ASKED, "Asked"),
        (STATUS_WITHDRAWN, "Withdrawn"),
        (STATUS_ACTIVE, "Active"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_ANSWERED, "Answered"),
    ]
    text = models.TextField()
    queue = models.ForeignKey(Queue, on_delete=models.CASCADE)
    video_chat_url = models.URLField(blank=True, null=True)

    note = models.CharField(max_length=255, blank=True, null=True)
    resolved_note = models.BooleanField(default=True)

    status = models.CharField(max_length=9, choices=STATUS_CHOICES, default=STATUS_ASKED)

    time_asked = models.DateTimeField(auto_now_add=True)
    asked_by = models.ForeignKey(User, related_name="asked_questions", on_delete=models.CASCADE)

    time_response_started = models.DateTimeField(blank=True, null=True)
    time_responded_to = models.DateTimeField(blank=True, null=True)
    responded_to_by = models.ForeignKey(
        User, related_name="responded_questions", on_delete=models.SET_NULL, blank=True, null=True
    )
    # This field should be a custom message or one of the following:
    # OTHER, NOT_HERE, OH_ENDED, NOT_SPECIFIC, or WRONG_QUEUE
    rejected_reason = models.CharField(max_length=255, blank=True, null=True)

    should_send_up_soon_notification = models.BooleanField(default=False)
    tags = models.ManyToManyField(Tag, blank=True)


class Announcement(models.Model):
    """
    TA announcement within a class
    """

    content = models.CharField(max_length=255)
    author = models.ForeignKey(User, related_name="announcements", on_delete=models.CASCADE)
    time_updated = models.DateTimeField(auto_now=True)
    course = models.ForeignKey(Course, related_name="announcements", on_delete=models.CASCADE)
