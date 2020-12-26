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

    class Meta:
        constraints = [models.UniqueConstraint(fields=["course", "name"], name="unique_queue_name")]

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


class QueueStatistic(models.Model):
    """
    Statistics related to a queue
    """

    # add new metrics/statistics
    METRIC_HEATMAP_WAIT = "HEATMAP_AVG_WAIT"
    METRIC_AVG_WAIT = "AVG_WAIT"
    METRIC_NUM_ANSWERED = "NUM_ANSWERED"
    METRIC_STUDENTS_HELPED = "STUDENTS_HELPED"
    METRIC_AVG_TIME_HELPING = "AVG_TIME_HELPING"
    METRIC_LIST_WAIT_TIME_DAYS = "LIST_WAIT_TIME_DAYS"
    METRIC_CHOICES = [
        (METRIC_HEATMAP_WAIT, "Average wait-time heatmap"),
        (METRIC_AVG_WAIT, "Average wait-time"),
        (METRIC_NUM_ANSWERED, "Number of questions answered per week"),
        (METRIC_STUDENTS_HELPED, "Students helped per week"),
        (METRIC_AVG_TIME_HELPING, "Average time helping students"),
        (METRIC_LIST_WAIT_TIME_DAYS, "List of wait times per day"),
    ]

    # for specific days during the week - used for heatmap and graphs where day is x-axis
    DAY_MONDAY = 0
    DAY_TUESDAY = 1
    DAY_WEDNESDAY = 2
    DAY_THURSDAY = 3
    DAY_FRIDAY = 4
    DAY_SATURDAY = 5
    DAY_SUNDAY = 6
    DAY_CHOICES = [
        (DAY_MONDAY, "Monday"),
        (DAY_TUESDAY, "Tuesday"),
        (DAY_WEDNESDAY, "Wednesday"),
        (DAY_THURSDAY, "Thursday"),
        (DAY_FRIDAY, "Friday"),
        (DAY_SATURDAY, "Saturday"),
        (DAY_SUNDAY, "Sunday"),
    ]

    # used in heatmap - hopefully ints for time and day will make it easier to sort and group
    TIME_RANGE_INTERVAL = 4
    TIME_0_4 = 0
    TIME_4_8 = 4
    TIME_8_12 = 8
    TIME_12_16 = 12
    TIME_16_20 = 16
    TIME_20_24 = 20
    TIME_RANGE_CHOICES = [
        (TIME_0_4, "12AM-4AM"),
        (TIME_4_8, "4AM-8AM"),
        (TIME_8_12, "8AM-12PM"),
        (TIME_12_16, "12PM-4PM"),
        (TIME_16_20, "4PM-8PM"),
        (TIME_20_24, "8PM-12AM"),
    ]

    queue = models.ForeignKey(Queue, on_delete=models.CASCADE)
    metric = models.CharField(max_length=256, choices=METRIC_CHOICES)
    value = models.DecimalField(max_digits=16, decimal_places=8)

    day = models.IntegerField(choices=DAY_CHOICES, blank=True, null=True)
    time_range = models.IntegerField(choices=TIME_RANGE_CHOICES, blank=True, null=True)
    date = models.DateField(blank=True, null=True)  # for weekly stats, set to the Sunday of week

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["queue", "metric", "day", "time_range", "date"], name="unique_statistic"
            )
        ]

    def name_to_pretty(self):
        return [pretty for raw, pretty in QueueStatistic.METRIC_CHOICES if raw == self.metric][0]

    def day_to_pretty(self):
        pretty_lst = [pretty for raw, pretty in QueueStatistic.DAY_CHOICES if raw == self.day]
        if len(pretty_lst):
            return pretty_lst[0]
        else:
            return ""

    def time_range_to_pretty(self):
        pretty_lst = [
            pretty for raw, pretty in QueueStatistic.TIME_RANGE_CHOICES if raw == self.time_range
        ]
        if len(pretty_lst):
            return pretty_lst[0]
        else:
            return ""

    def __str__(self):
        string = f"{self.queue}: {self.name_to_pretty()}"
        if self.day_to_pretty() != "":
            string += " " + self.day_to_pretty()
        if self.time_range_to_pretty() != "":
            string += " " + self.time_range_to_pretty()
        return string
