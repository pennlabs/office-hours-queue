from django.contrib import auth
from django.test import TestCase

from ohq.models import Course, Membership, MembershipInvite, Semester


class BackendTestCase(TestCase):
    def setUp(self):
        self.remote_user = {
            "pennid": 1,
            "first_name": "First",
            "last_name": "Last",
            "username": "user",
            "email": "user@seas.upenn.edu",
            "affiliation": [],
            "user_permissions": [],
            "groups": ["student", "member"],
            "token": {"access_token": "abc", "refresh_token": "123", "expires_in": 100},
        }

    def test_convert_invites(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        MembershipInvite.objects.create(
            course=course, kind=Membership.KIND_PROFESSOR, email="user@seas.upenn.edu"
        )
        user = auth.authenticate(remote_user=self.remote_user)
        self.assertEqual(MembershipInvite.objects.all().count(), 0)
        self.assertEqual(Membership.objects.all().count(), 1)
        membership = Membership.objects.get(course=course)
        self.assertEqual(membership.kind, Membership.KIND_PROFESSOR)
        self.assertEqual(membership.user, user)
