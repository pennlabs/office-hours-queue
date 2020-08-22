from unittest.mock import patch

from django.test import TestCase
from twilio.base.exceptions import TwilioRestException

from ohq.sms import sendSMSVerification


class sendSMSVerificationTestCase(TestCase):
    def test_invalid_client(self):
        self.assertFalse(sendSMSVerification("+15555555555", "123456"))

    @patch("ohq.sms.Client")
    def test_rest_exception(self, mock_client):
        mock_client.return_value.messages.create.side_effect = TwilioRestException("", "")
        self.assertFalse(sendSMSVerification("+15555555555", "123456"))

    @patch("ohq.sms.Client")
    def test_send_sms(self, mock_client):
        self.assertTrue(sendSMSVerification("+15555555555", "123456"))
        mock_client.assert_called()
        mock_calls = mock_client.mock_calls
        self.assertEqual(2, len(mock_calls))
        expected = {
            "to": "+15555555555",
            "body": "Your OHQ Verification Code is: 123456",
            "from_": "",
        }
        self.assertEqual(expected, mock_client.mock_calls[1][2])
