import uuid
from enum import Enum

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import PermissionsMixin, AbstractBaseUser, BaseUserManager
from django.contrib.postgres.fields import ArrayField
from phonenumber_field.modelfields import PhoneNumberField
from polymorphic.models import PolymorphicModel


class ChoicesEnum(Enum):
    @classmethod
    def choices(cls):
        c = [(key.value, key.name) for key in cls]
        l = max([len(key.value) for key in cls])
        return dict(choices=c, max_length=l)


class AuthUserManager(BaseUserManager):
    def create_user(self, firebase_uid, email, **kwargs):
        user = AuthUser(firebase_uid=firebase_uid, email=email)
        user.set_unusable_password()
        user.save()
        return user

    def create_superuser(self, firebase_uid, password, email, **kwargs):
        user = AuthUser(firebase_uid=firebase_uid, email=email, is_superuser=True, is_staff=True)
        user.set_password(password)
        user.save()
        return user


class AuthUser(AbstractBaseUser, PermissionsMixin):
    firebase_uid = models.CharField(max_length=40, unique=True, editable=False)
    email = models.EmailField()
    is_staff = models.BooleanField(
        default=False,
        help_text='Designates whether the user can log into this admin site.',
    )
    USERNAME_FIELD = 'firebase_uid'
    REQUIRED_FIELDS = ['email']
    objects = AuthUserManager()

    def get_user(self):
        return self.user_set.get()


class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    full_name = models.CharField(max_length=100)
    preferred_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = PhoneNumberField(blank=True, null=True)
    time_joined = models.DateTimeField(auto_now_add=True)
    auth_user = models.ForeignKey(AuthUser, on_delete=models.CASCADE)

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
    archived = models.BooleanField(default=False)
    invite_only = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["name", "department", "year", "semester"],
                name="unique_course_name",
            )
        ]

    @property
    def student_users(self):
        return self.course_users.filter(kind=CourseUserKind.STUDENT)

    @property
    def ta_users(self):
        return self.course_users.filter(kind=CourseUserKind.TA)

    @property
    def head_ta_users(self):
        return self.course_users.filter(kind=CourseUserKind.HEAD_TA)

    def __str__(self):
        return self.department + " " + self.name


class CourseUserKind(ChoicesEnum):
    STUDENT = "STUDENT"
    TA = "TA"
    HEAD_TA = "HEAD_TA"
    PROFESSOR = "PROFESSOR"
    ADMIN = "ADMIN"


class CourseUser(models.Model):
    course = models.ForeignKey(Course, related_name='course_users', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='course_users', on_delete=models.CASCADE)
    kind = models.CharField(**CourseUserKind.choices())
    is_deactivated = models.BooleanField(default=False)
    time_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "user"],
                name="unique_course_user",
            )
        ]

    def __str__(self):
        return f'{self.user.full_name} - {self.course}'


class InvitedCourseUser(models.Model):
    course = models.ForeignKey(
        Course,
        related_name='invited_course_users',
        on_delete=models.CASCADE,
    )
    email = models.EmailField()
    kind = models.CharField(**CourseUserKind.choices())
    time_created = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(
        User,
        related_name='invited_users',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "email"],
                name="unique_invited_course_user",
            )
        ]

    def __str__(self):
        return f'{self.email} - {self.course}'


class Queue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    course = models.ForeignKey(Course, related_name='queues', on_delete=models.CASCADE)
    archived = models.BooleanField(default=False)

    estimated_wait_time = models.IntegerField(default=0)
    start_end_times = models.CharField(max_length=100)

    tags = ArrayField(models.CharField(max_length=20))

    MAX_NUMBER_QUEUES = 2

    def is_active(self):
        # TODO
        return None

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "name"],
                name="unique_queue_name",
            )
        ]

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

    time_asked = models.DateTimeField(auto_now_add=True)
    asked_by = models.ForeignKey(
        User,
        related_name='asked_questions',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    # TODO I don't think we should allow question editing
    time_last_updated = models.DateTimeField(blank=True, null=True)
    time_withdrawn = models.DateTimeField(blank=True, null=True)

    time_rejected = models.DateTimeField(blank=True, null=True)
    rejected_by = models.ForeignKey(
        User,
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
    rejected_reason_other = models.CharField(max_length=200, blank=True, null=True)

    time_started = models.DateTimeField(blank=True, null=True)
    time_answered = models.DateTimeField(blank=True, null=True)
    answered_by = models.ForeignKey(
        User,
        related_name='answered_questions',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    def __str__(self):
        return str(self.time_asked)


class FeedbackQuestion(PolymorphicModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question_text = models.CharField(max_length=200, editable=False)
    # TODO cannot change is_active while a queue is active
    archived = models.BooleanField(default=False)
    order_key = models.IntegerField()
    course = models.ForeignKey(Course, related_name='feedback_questions', on_delete=models.CASCADE)


class ShortAnswerFeedbackQuestion(FeedbackQuestion):
    pass


class RadioButtonFeedbackQuestion(FeedbackQuestion):
    answer_choices = ArrayField(models.CharField(max_length=200), editable=False)


class SliderFeedbackQuestion(FeedbackQuestion):
    answer_lower_bound = models.IntegerField(editable=False)
    answer_upper_bound = models.IntegerField(editable=False)


class FeedbackAnswer(PolymorphicModel):
    question = models.ForeignKey(FeedbackQuestion, related_name='answers', on_delete=models.CASCADE)
    time_created = models.DateTimeField(auto_now_add=True)


class ShortAnswerFeedbackAnswer(FeedbackQuestion):
    answer_text = models.TextField()


class RadioButtonFeedbackAnswer(FeedbackQuestion):
    answer_choice = models.IntegerField()


class SliderFeedbackAnswer(FeedbackQuestion):
    answer_choice = models.IntegerField()


