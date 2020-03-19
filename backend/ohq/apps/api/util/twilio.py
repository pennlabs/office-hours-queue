from decouple import config
from twilio.rest import Client

from ohq.apps.api.models import User

# Your Account Sid and Auth Token from twilio.com/console
# DANGER! This is insecure. See http://twil.io/secure
account_sid = 'AC9ee7a40d947a92f4df60c71eb55b7c68'
auth_token = config('TWILIO_AUTH_TOKEN')
client = Client(account_sid, auth_token)

def send_up_soon_sms(question):
    if (
        not question.should_send_up_soon_notification or
        not question.asked_by or
        not question.asked_by.phone_number or
        not question.asked_by.sms_notifications_enabled or
        not question.asked_by.sms_verified
    ):
        return None
    message = client.messages.create(
         body=f"OHQ: You are currently 3rd in line for "
              f"{question.queue.course.formatted_course_code}, be ready soon!",
         messaging_service_sid='MG249e68aef1b3ca07406126424e8795a4',
         to=str(question.asked_by.phone_number),
     )
    return message.sid

def send_verification_sms(user):
    print(user)
    print(user.sms_notifications_enabled, user.phone_number, user.sms_verification_code)
    if (
        not user.phone_number or
        not user.sms_verification_code
    ):
        return None
    message = client.messages.create(
        body=f"Your OHQ verification code is: {user.sms_verification_code}. Expires in "
             f"{User.SMS_VERIFICATION_EXPIRATION_MINUTES} minutes.",
        messaging_service_sid='MG249e68aef1b3ca07406126424e8795a4',
        to=str(user.phone_number),
    )
    return message.sid
