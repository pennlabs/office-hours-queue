from django.conf import settings
from sentry_sdk import capture_message
from twilio.base.exceptions import TwilioException, TwilioRestException
from twilio.rest import Client


def sendSMSVerification(to, verification_code):
    try:
        client = Client(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN)
        body = f"Your OHQ Verification Code is: {verification_code}"
        msg = client.messages.create(to=to, from_=settings.TWILIO_NUMBER, body=body)
        return msg.sid is not None
    except TwilioRestException as e:
        capture_message(e, level="error")
        return False
    except TwilioException as e:  # likely a credential issue in development
        capture_message(e, level="error")
        return False
