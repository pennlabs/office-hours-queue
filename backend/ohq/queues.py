from datetime import timedelta

from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue


def calculate_wait_times():
    """
    Generate the average wait time for a queue by averaging the time it took to respond to all
    questions in the last 10 minutes. Set the wait time to -1 for all closed queues with no
    remaining questions.
    """

    # TODO: don't set wait time to -1 if a queue still has questions in it
    Queue.objects.filter(archived=False, active=False).update(estimated_wait_time=-1)

    time = timezone.now() - timedelta(minutes=10)
    queues = Queue.objects.filter(archived=False, active=True)
    for queue in queues:
        avg = Question.objects.filter(queue=queue, time_response_started__gt=time).aggregate(
            avg_wait=Avg(F("time_response_started") - F("time_asked"))
        )
        wait = avg["avg_wait"]
        # only recalculate average if we have a valid average
        if wait:
            queue.estimated_wait_time = wait.seconds // 60
        queue.save()
