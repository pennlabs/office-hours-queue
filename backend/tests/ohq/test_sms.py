from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from twilio.base.exceptions import TwilioRestException

from ohq.models import Course, Semester
from ohq.sms import sendSMS, sendSMSVerification, sendUpNextNotification


User = get_user_model()


class sendSMSTestCase(TestCase):
    @patch("ohq.sms.capture_message")
    def test_invalid_client(self, mock_sentry):
        sendSMS("+15555555555", "Body")
        mock_sentry.assert_called()
        self.assertEqual(1, len(mock_sentry.mock_calls))
        expected = {"level": "error"}
        self.assertEqual(expected, mock_sentry.call_args[1])

    @patch("ohq.sms.capture_message")
    @patch("ohq.sms.Client")
    def test_rest_exception(self, mock_client, mock_sentry):
        mock_client.return_value.messages.create.side_effect = TwilioRestException("", "")
        sendSMS("+15555555555", "Body")
        mock_sentry.assert_called()
        self.assertEqual(1, len(mock_sentry.mock_calls))
        expected = {"level": "error"}
        self.assertEqual(expected, mock_sentry.call_args[1])

    @patch("ohq.sms.Client")
    def test_send_sms(self, mock_client):
        sendSMS("+15555555555", "Body")
        mock_client.assert_called()
        mock_calls = mock_client.mock_calls
        self.assertEqual(2, len(mock_calls))
        expected = {
            "to": "+15555555555",
            "body": "Body",
            "from_": "",
        }
        self.assertEqual(expected, mock_client.mock_calls[1][2])


class sendSMSVerificationTestCase(TestCase):
    @patch("ohq.sms.sendSMS")
    def test_verification(self, mock_send):
        phone_number = "+15555555555"
        verification_code = "123456"
        sendSMSVerification(phone_number, verification_code)
        mock_send.assert_called()
        self.assertEqual(1, len(mock_send.mock_calls))
        body = f"Your OHQ Verification Code is: {verification_code}"
        self.assertEqual(phone_number, mock_send.call_args[0][0])
        self.assertEqual(body, mock_send.call_args[0][1])


class sendUpNextNotificationTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="Penn Labs", semester=self.semester
        )
        self.student = User.objects.create(username="student")
        self.phone_number = "+15555555555"
        self.student.profile.phone_number = self.phone_number
        self.student.save()

    @patch("ohq.sms.sendSMS")
    def test_notification(self, mock_send):
        sendUpNextNotification(self.student, self.course)
        mock_send.assert_called()
        self.assertEqual(1, len(mock_send.mock_calls))
        self.assertEqual(self.phone_number, mock_send.call_args[0][0])
        course_title = f"{self.course.department} {self.course.course_code}"
        body = f"You are currently 3rd in line for {course_title}, be ready soon!"
        self.assertEqual(body, mock_send.call_args[0][1])
