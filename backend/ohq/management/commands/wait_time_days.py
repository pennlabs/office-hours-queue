from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the average wait time for queues yesterday"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        # assuming the cron job will run daily at midnight, we only need to add yesterday
        today = timezone.datetime.today().date()
        yesterday = today - timezone.timedelta(days=1)

        for queue in queues:
            avg = Question.objects.filter(
                queue=queue, time_response_started__date=yesterday
            ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

            wait = avg["avg_wait"]

            QueueStatistic.objects.update_or_create(
                queue=queue,
                metric=QueueStatistic.METRIC_LIST_WAIT_TIME_DAYS,
                date=yesterday,
                defaults={"value": wait.seconds if wait else 0},
            )
