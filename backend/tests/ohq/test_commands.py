from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from ohq.models import Course, Membership, MembershipInvite, Semester


User = get_user_model()


@patch("ohq.management.commands.calculatewaittimes.calculate_wait_times")
class CalculateWaitTimesTestCase(TestCase):
    def test_call_command(self, mock_calculate):
        out = StringIO()
        call_command("calculatewaittimes", stdout=out)
        mock_calculate.assert_called()
        self.assertEqual("Updated estimated queue wait times!\n", out.getvalue())


class RegisterClassTestCase(TestCase):
    def setUp(self):
        self.course = ("CIS", "160", "Math", "FALL", "2020")

        Semester.objects.create(year="2020", term="FALL")
        User.objects.create_user("prof1", "prof1@a.com", "prof1")
        User.objects.create_user("head1", "head1@a.com", "head1")

    def test_input_email_role_length_mismatch(self):
        with self.assertRaises(CommandError):
            call_command(
                "registerclass",
                *self.course,
                emails=["a@b.com", "a@c.com"],
                roles=[Membership.KIND_PROFESSOR],
            )

    def test_register_class(self):
        out = StringIO()
        call_command(
            "registerclass",
            *self.course,
            emails=["prof1@a.com", "head1@a.com", "prof2@a.com", "head2@a.com"],
            roles=[
                Membership.KIND_PROFESSOR,
                Membership.KIND_HEAD_TA,
                Membership.KIND_PROFESSOR,
                Membership.KIND_HEAD_TA,
            ],
            stdout=out,
        )
        course = Course.objects.get(department="CIS", course_code="160")
        self.assertEqual(course.course_title, "Math")
        self.assertEqual(course.semester.year, 2020)
        self.assertEqual(course.semester.term, "FALL")

        prof1 = Membership.objects.get(
            course__course_code="160", course__department="CIS", user__email="prof1@a.com"
        )
        prof2 = MembershipInvite.objects.get(
            course__course_code="160", course__department="CIS", email="prof2@a.com"
        )
        head1 = Membership.objects.get(
            course__course_code="160", course__department="CIS", user__email="head1@a.com"
        )
        head2 = MembershipInvite.objects.get(
            course__course_code="160", course__department="CIS", email="head2@a.com"
        )

        self.assertEqual(Membership.KIND_PROFESSOR, prof1.kind)
        self.assertEqual(Membership.KIND_PROFESSOR, prof2.kind)
        self.assertEqual(Membership.KIND_HEAD_TA, head1.kind)
        self.assertEqual(Membership.KIND_HEAD_TA, head2.kind)

        course_msg = "Created new course CIS 160 in FALL 2020"
        prof_msg = "Added 1 professor(s) and invited 1 professor(s)"
        ta_msg = "Added 1 Head TA(s) and invited 1 Head TA(s)"

        stdout_msg = course_msg + "\n" + prof_msg + "\n" + ta_msg + "\n"

        self.assertEqual(stdout_msg, out.getvalue())
