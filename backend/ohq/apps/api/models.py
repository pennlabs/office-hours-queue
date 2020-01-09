import uuid
from enum import Enum

from django.db import models
from django.contrib.postgres.fields import ArrayField
from phonenumber_field.modelfields import PhoneNumberField
from polymorphic.models import PolymorphicModel

class ChoicesEnum(Enum):
    @classmethod
    def choices(cls):
        c = [(key.value, key.name) for key in cls]
        l = max([len(key.value) for key in cls])
        return dict(choices=c, max_length=l)


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    full_name = models.CharField(max_length=100)
    preferred_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(blank=True, null=True)

    def __str__(self):
        return self.full_name


class Semester(ChoicesEnum):
    FALL = "FALL"
    SPRING = "SPRING"
    SUMMER = "SUMMER"


class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    description = models.CharField(max_length=250, default="")
    year = models.IntegerField()
    semester = models.CharField(**Semester.choices())
    is_archived = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "department", "year"],
                name="unique_course_name",
            )
        ]

    @property
    def student_users(self):
        return self.course_users.filter(kind=CourseUserType.STUDENT)

    @property
    def ta_users(self):
        return self.course_users.filter(kind=CourseUserType.TA)

    @property
    def head_ta_users(self):
        return self.course_users.filter(kind=CourseUserType.HEAD_TA)

    def __str__(self):
        return self.department + " " + self.name


class CourseUserType(ChoicesEnum):
    STUDENT = "STUDENT"
    TA = "TA"
    HEAD_TA = "HEAD_TA"
    PROFESSOR = "PROFESSOR"
    ADMIN = "ADMIN"


class CourseUser(models.Model):
    course = models.ForeignKey(Course, related_name='course_users', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='course_users', on_delete=models.CASCADE)
    kind = models.CharField(**CourseUserType.choices())
    is_deactivated = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "user"],
                name="unique_course_user",
            )
        ]

    def __str__(self):
        return f'{self.user.full_name} - {self.course}'


class Queue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    course = models.ForeignKey(Course, related_name='queues', on_delete=models.CASCADE)

    estimated_wait_time = models.IntegerField(default=0)
    start_end_times = models.CharField(max_length=100)

    tags = ArrayField(models.CharField(max_length=20))

    def is_active(self):
        # TODO
        return None

    def __str__(self):
        return f'{self.name} - {self.course}'


class QuestionRejectionReason(ChoicesEnum):
    OTHER = "OTHER"
    NOT_HERE = "NOT_HERE"
    OH_ENDED = "OH_ENDED"
    NOT_SPECIFIC = "NOT_SPECIFIC"
    WRONG_QUEUE = "WRONG_QUEUE"


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField()
    tags = ArrayField(models.CharField(max_length=20))
    queue = models.ForeignKey(
        Queue,
        related_name='questions',
        on_delete=models.CASCADE,
    )

    time_asked = models.DateTimeField()
    time_last_updated = models.DateTimeField(blank=True, null=True)
    time_started = models.DateTimeField(blank=True, null=True)
    time_answered = models.DateTimeField(blank=True, null=True)
    time_withdrawn = models.DateTimeField(blank=True, null=True)

    time_rejected = models.DateTimeField(blank=True, null=True)

    is_rejected = models.BooleanField(default=False)
    rejected_by = models.ForeignKey(
        CourseUser,
        related_name='rejected_questions',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    rejected_reason = models.CharField(
        blank=True,
        null=True,
        **QuestionRejectionReason.choices(),
    )

    asker = models.ForeignKey(
        CourseUser,
        related_name='asked_questions',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    answerer = models.ForeignKey(
        CourseUser,
        related_name='answered_questions',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    def __str__(self):
        return str(self.time_asked)


class FeedbackQuestion(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question_text = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    order_key = models.IntegerField()


class ShortAnswerFeedbackQuestion(FeedbackQuestion):
    pass


class RadioButtonFeedbackQuestion(FeedbackQuestion):
    answer_choices = ArrayField(models.CharField(max_length=200))


class SliderFeedbackQuestion(FeedbackQuestion):
    answer_lower_bound = models.IntegerField()
    answer_upper_bound = models.IntegerField()


class FeedbackAnswer(PolymorphicModel):
    question = models.ForeignKey(FeedbackQuestion, related_name='answers', on_delete=models.CASCADE)


class ShortAnswerFeedbackAnswer(FeedbackQuestion):
    answer_text = models.TextField()


class RadioButtonFeedbackAnswer(FeedbackQuestion):
    answer_choice = models.IntegerField()


class SliderFeedbackAnswer(FeedbackQuestion):
    answer_choice = models.IntegerField()


