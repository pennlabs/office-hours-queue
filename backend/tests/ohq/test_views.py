import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from djangorestframework_camel_case.util import camelize
from rest_framework.test import APIClient

from ohq.models import Course, Membership, MembershipInvite, Semester
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
