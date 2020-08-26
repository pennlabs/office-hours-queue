from celery import shared_task

from ohq.models import Question
from ohq.sms import sendUpNextNotification


@shared_task(name="ohq.tasks.sendUpNextNotificationTask")
def sendUpNextNotificationTask(queue_id):
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
            sendUpNextNotification(user, question.queue.course)
