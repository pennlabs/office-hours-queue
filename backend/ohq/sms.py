from django.conf import settings
from sentry_sdk import capture_message
from twilio.base.exceptions import TwilioException, TwilioRestException
from twilio.rest import Client

from ohq.models import Question


def sendSMS(to, body):
    try:
        client = Client(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN)
        msg = client.messages.create(to=str(to), from_=settings.TWILIO_NUMBER, body=body)
        return msg.sid is not None
    except TwilioRestException as e:
        capture_message(e, level="error")
        return False
    except TwilioException as e:  # likely a credential issue in development
        capture_message(e, level="error")
        return False


def sendSMSVerification(to, verification_code):
    body = f"Your OHQ Verification Code is: {verification_code}"
    sendSMS(to, body)


def sendUpNextNotification(queue_id):
    """
    Send an SMS notification to the 3rd person in a queue if they have verified their phone number
    and the queue was at least 4 people long when they joined it.
    """

    questions = Question.objects.filter(queue=queue_id, status=Question.STATUS_ASKED).order_by(
        "time_asked"
    )
    if questions.count() >= 3:
        question = questions[2]
        user = question.asked_by
        if question.should_send_up_soon_notification and user.profile.sms_verified:
            course = question.queue.course
            course_title = f"{course.department} {course.course_code}"
            body = f"You are currently 3rd in line for {course_title}, be ready soon!"
            sendSMS(user.profile.phone_number, body)
