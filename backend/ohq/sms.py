from django.conf import settings
from sentry_sdk import capture_message
from twilio.base.exceptions import TwilioException, TwilioRestException
from twilio.rest import Client


def sendSMS(to, body):
    try:
        client = Client(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(to=str(to), from_=settings.TWILIO_NUMBER, body=body)
    except TwilioRestException as e:
        capture_message(e, level="error")
    except TwilioException as e:  # likely a credential issue in development
        capture_message(e, level="error")


def sendSMSVerification(to, verification_code):
    body = f"Your OHQ Verification Code is: {verification_code}"
    sendSMS(to, body)


def sendUpNextNotification(user, course):
    course_title = f"{course.department} {course.course_code}"
    body = f"You are currently 3rd in line for {course_title}, be ready soon!"
    sendSMS(user.profile.phone_number, body)
