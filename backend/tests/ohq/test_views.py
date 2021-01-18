import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from djangorestframework_camel_case.util import camelize
from rest_framework.test import APIClient

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester
from ohq.serializers import UserPrivateSerializer


User = get_user_model()


class UserViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username="user")
        self.serializer = UserPrivateSerializer(self.user)

    def test_get_object(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse("ohq:me"))
        self.assertEqual(json.loads(response.content), camelize(self.serializer.data))


class ResendNotificationViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create(username="user")
        self.verification_code = "123456"
        self.user.profile.sms_verification_code = self.verification_code
        self.user.profile.sms_verification_timestamp = timezone.now()

    def test_resend_fail(self):
        """
        Ensure resend fails if sent within 10 minutes.
        """

        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("ohq:resend"))
        self.assertEqual(400, response.status_code)

    def test_resend_success(self):
        """
        Ensure resend works if sent after 10 minutes.
        """

        self.user.profile.sms_verification_timestamp = timezone.now() - timedelta(minutes=11)
        self.client.force_authenticate(user=self.user)
        response = self.client.post(reverse("ohq:resend"))
        self.assertEqual(200, response.status_code)
        self.assertNotEqual(self.verification_code, self.user.profile.sms_verification_code)


class MassInviteTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.professor = User.objects.create(username="professor", email="professor@example.com")
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        Membership.objects.create(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.user2 = User.objects.create(username="user2", email="user2@example.com")

        MembershipInvite.objects.create(course=self.course, email="user3@example.com")

    def test_invalid_email(self):
        self.client.force_authenticate(user=self.professor)
        response = self.client.post(
            reverse("ohq:mass-invite", args=[self.course.id]),
            data={"emails": "invalidemail", "role": "TA"},
        )
        self.assertEqual(400, response.status_code)

    def test_valid_emails(self):
        self.client.force_authenticate(user=self.professor)
        emails = "professor@example.com,user2@example.com,user3@example.com,user4@example.com"
        response = self.client.post(
            reverse("ohq:mass-invite", args=[self.course.id]),
            data={"emails": emails, "kind": "TA"},
        )

        self.assertEqual(201, response.status_code)

        # Correct number of invites and memberships created
        content = json.loads(response.content)
        self.assertEqual(1, content["membersAdded"])
        self.assertEqual(1, content["invitesSent"])


class QuestionViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_FALL)
        self.course = Course.objects.create(
            course_code="000", department="Test Class", semester=self.semester
        )
        self.queue = Queue.objects.create(
            name="Queue",
            course=self.course,
            rate_limit_length=0,
            rate_limit_minutes=20,
            rate_limit_questions=1,
        )
        self.ta = User.objects.create(username="ta")
        self.student = User.objects.create(username="student")
        self.student2 = User.objects.create(username="student2")
        Membership.objects.create(course=self.course, user=self.ta, kind=Membership.KIND_TA)
        Membership.objects.create(
            course=self.course, user=self.student, kind=Membership.KIND_STUDENT
        )
        Membership.objects.create(
            course=self.course, user=self.student2, kind=Membership.KIND_STUDENT
        )
        self.question = Question.objects.create(
            queue=self.queue, asked_by=self.student, text="Help me"
        )

    def test_rate_limit(self):
        self.client.force_authenticate(user=self.student)
        self.client.patch(
            reverse("ohq:question-detail", args=[self.course.id, self.queue.id, self.question.id]),
            {"status": Question.STATUS_ANSWERED},
        )
        self.assertEqual(1, Question.objects.all().count())

        res = self.client.post(
            reverse("ohq:question-list", args=[self.course.id, self.queue.id]),
            {"text": "Should be rate limited", "tags": []},
        )
        self.assertEqual(429, res.status_code)
        self.assertEqual(1, Question.objects.all().count())

        self.client.force_authenticate(user=self.student2)
        self.client.post(
            reverse("ohq:question-list", args=[self.course.id, self.queue.id]),
            {"text": "Shouldn't be rate limited", "tags": []},
        )
        self.assertEqual(2, Question.objects.all().count())
