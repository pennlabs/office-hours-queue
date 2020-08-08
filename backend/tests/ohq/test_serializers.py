from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from ohq.serializers import UserPrivateSerializer


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
        self.serializer.update(
            self.user, {"profile": {"sms_verification_code": "ABC123"}},
        )
        self.assertFalse(self.user.profile.sms_verified)

    def test_verify_phone_number_time_expired(self):
        self.serializer.update(self.user, {"profile": {"phone_number": "+15555555555"}})
        date = timezone.make_aware(datetime(2020, 1, 1))
        self.user.profile.sms_verification_timestamp = date
        self.serializer.update(
            self.user,
            {"profile": {"sms_verification_code": self.user.profile.sms_verification_code}},
        )
        self.assertFalse(self.user.profile.sms_verified)
