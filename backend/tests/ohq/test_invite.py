import json

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse

from ohq.invite import parse_and_send_invites
from ohq.models import Course, Membership, MembershipInvite, Semester


User = get_user_model()


class ParseAndSendInvitesTestCase(TestCase):
    def setUp(self):
        self.professor = User.objects.create(username="professor", email="professor@seas.upenn.edu")
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        Membership.objects.create(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.user2 = User.objects.create(username="user2", email="user2@sas.upenn.edu")

        MembershipInvite.objects.create(course=self.course, email="user3@wharton.upenn.edu")

    def test_invalid_email(self):
        with self.assertRaises(ValidationError):
            parse_and_send_invites(self.course, ["not an email"], Membership.KIND_TA)

    def test_valid_emails(self):
        """
        Test situations where
        * the user is already a member under a different email
        * the user is not a member of the course and has different email
        * the email has already been sent an invite
        """
        members_added, invites_sent = parse_and_send_invites(
            self.course,
            [
                "professor@sas.upenn.edu",
                "user2@seas.upenn.edu",
                "user3@wharton.upenn.edu",
                "user4@nursing.upenn.edu",
            ],
            Membership.KIND_TA,
        )

        # # Correct number of invites and memberships created
        self.assertEqual(1, members_added)
        self.assertEqual(1, invites_sent)

        # Membership is created for user2
        self.assertEqual(
            1,
            Membership.objects.filter(
                user=self.user2, course=self.course, kind=Membership.KIND_TA
            ).count(),
        )

        # Duplicate membership for user 1 isn't created
        self.assertEqual(2, Membership.objects.all().count())

        # Invite is sent to 4@nursing.upenn.edu
        self.assertEqual(
            1,
            MembershipInvite.objects.filter(
                email="user4@nursing.upenn.edu", course=self.course, kind=Membership.KIND_TA
            ).count(),
        )

        # Duplicate membership invite for 3@example.com isn't created
        self.assertEqual(2, MembershipInvite.objects.all().count())
