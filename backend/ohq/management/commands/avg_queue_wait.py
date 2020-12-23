from django.core.management.base import BaseCommand
from ohq.models import Question, Queue, QueueStatistic
from django.db.models import Avg, F

class Command(BaseCommand):
    help = "Calculates the average wait time for queues and puts them in queue statistics"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        for queue in queues:
            avg = Question.objects.filter(queue=queue) \
                    .exclude(time_response_started__isnull=True) \
                    .aggregate(
                        avg_wait= Avg(F("time_response_started") - F("time_asked"))
                    )

            wait = avg["avg_wait"]

            QueueStatistic.objects.update_or_create(queue=queue, metric=QueueStatistic.METRIC_AVG_WAIT,
                defaults={'value': wait.seconds if wait else 0}
            )

