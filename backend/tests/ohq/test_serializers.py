from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import RequestFactory, TestCase
from django.utils import timezone
from rest_framework import serializers

from ohq.models import Course, Membership, Semester
from ohq.serializers import (
    CourseSerializer,
    MembershipSerializer,
    SemesterSerializer,
    UserPrivateSerializer,
)


User = get_user_model()


class UserPrivateSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="user")
        self.serializer = UserPrivateSerializer(instance=self.user)

    def test_set_sms_notifications_enabled(self):
        self.assertFalse(self.user.profile.sms_notifications_enabled)
        self.serializer.update(self.user, {"profile": {"sms_notifications_enabled": True}})
        self.assertTrue(self.user.profile.sms_notifications_enabled)

    def test_set_new_phone_number(self):
        self.assertIsNone(self.user.profile.sms_verification_timestamp)
        phone_number = "+15555555555"
        self.serializer.update(self.user, {"profile": {"phone_number": phone_number}})
        self.assertFalse(self.user.profile.sms_verified)
        self.assertEqual(self.user.profile.phone_number, phone_number)
        self.assertIsNotNone(self.user.profile.sms_verification_timestamp)
        self.assertRegex(self.user.profile.sms_verification_code, "[0-9]{6}")

    def test_verify_phone_number(self):
        self.serializer.update(self.user, {"profile": {"phone_number": "+15555555555"}})
        self.serializer.update(
            self.user,
            {"profile": {"sms_verification_code": self.user.profile.sms_verification_code}},
        )
        self.assertTrue(self.user.profile.sms_verified)

    def test_verify_phone_number_invalid(self):
        self.serializer.update(self.user, {"profile": {"phone_number": "+15555555555"}})
        with self.assertRaises(serializers.ValidationError):
            self.serializer.update(
                self.user, {"profile": {"sms_verification_code": "ABC123"}},
            )

    def test_verify_phone_number_time_expired(self):
        self.serializer.update(self.user, {"profile": {"phone_number": "+15555555555"}})
        date = timezone.make_aware(datetime(2020, 1, 1))
        self.user.profile.sms_verification_timestamp = date
        with self.assertRaises(serializers.ValidationError):
            self.serializer.update(
                self.user,
                {"profile": {"sms_verification_code": self.user.profile.sms_verification_code}},
            )


class CourseSerializerTestCase(TestCase):
    def test_create_membership(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        user = User.objects.create(username="professor")
        data = {
            "course_code": "000",
            "department": "Penn Labs",
            "course_title": "Course",
            "semester": semester.id,
        }

        request = RequestFactory().get("/")
        request.user = user
        serializer = CourseSerializer(data=data, context={"request": request})
        serializer.is_valid()
        serializer.save()
        self.assertEqual(1, len(Membership.objects.all()))


class MembershipSerializerTestCase(TestCase):
    def test_create_membership(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(course_code="000", department="Penn Labs", semester=semester)

        user = User.objects.create(username="professor")

        class View(object):
            """
            Mock view object to provide a course pk
            """

            def __init__(self):
                self.kwargs = {"course_pk": course.id}

        request = RequestFactory().get("/")
        request.user = user
        serializer = MembershipSerializer(data={}, context={"request": request, "view": View()})
        serializer.is_valid()
        serializer.save()
        self.assertEqual(1, len(Membership.objects.all()))


class SemesterSerializerTestCase(TestCase):
    def test_pretty(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        serializer = SemesterSerializer(instance=semester)
        self.assertEqual(serializer.data["pretty"], str(semester))
