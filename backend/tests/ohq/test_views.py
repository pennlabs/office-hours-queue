import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from ohq.models import Course, Membership, MembershipInvite, Semester


User = get_user_model()


class MassInviteTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.professor = User.objects.create(username="professor", email="1@example.com")
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        Membership.objects.create(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.user2 = User.objects.create(username="user2", email="2@example.com")

        MembershipInvite.objects.create(course=self.course, email="3@example.com")

    def test_invalid_email(self):
        self.client.force_authenticate(user=self.professor)
        response = self.client.post(
            reverse("ohq:mass-invite", args=[self.course.id]),
            data={"emails": "invalidemail", "role": "TA"},
        )
        self.assertEqual(400, response.status_code)

    def test_valid_emails(self):
        self.client.force_authenticate(user=self.professor)
        response = self.client.post(
            reverse("ohq:mass-invite", args=[self.course.id]),
            data={
                "emails": "1@example.com,2@example.com,3@example.com,4@example.com",
                "kind": "TA",
            },
        )

        self.assertEqual(201, response.status_code)

        # Correct number of invites and memberships created
        content = json.loads(response.content)
        self.assertEqual(1, content["members_added"])
        self.assertEqual(1, content["invites_sent"])

        # Membership is created for user2
        self.assertEqual(
            1,
            Membership.objects.filter(
                user=self.user2, course=self.course, kind=Membership.KIND_TA
            ).count(),
        )

        # Duplicate membership for 1@example.com isn't created
        self.assertEqual(2, Membership.objects.all().count())

        # Invite is sent to 4@example.com
        self.assertEqual(
            1,
            MembershipInvite.objects.filter(
                email="4@example.com", course=self.course, kind=Membership.KIND_TA
            ).count(),
        )

        # Duplicate membership invite for 3@example.com isn't created
        self.assertEqual(2, MembershipInvite.objects.all().count())
