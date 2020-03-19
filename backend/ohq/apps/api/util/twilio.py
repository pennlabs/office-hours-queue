from decouple import config
from twilio.rest import Client


# Your Account Sid and Auth Token from twilio.com/console
# DANGER! This is insecure. See http://twil.io/secure
account_sid = 'AC9ee7a40d947a92f4df60c71eb55b7c68'
auth_token = config('TWILIO_AUTH_TOKEN')
client = Client(account_sid, auth_token)

def send_up_soon_sms(question):
    if not question.should_send_up_soon_notification:
        return None
    message = client.messages.create(
         body=f"You are currently 3rd in line for {question.queue.course.formatted_course_code}, "
              f"be ready soon!",
         messaging_service_sid='MG249e68aef1b3ca07406126424e8795a4',
         to='+19144096140',
     )
    return message.sid
