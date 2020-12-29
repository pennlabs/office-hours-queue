from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates average wait time for queues this week and puts them in queue statistics"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

        for queue in queues:
            avg = Question.objects.filter(
                queue=queue,
                time_asked__date__range=[last_sunday, next_sunday],
                time_response_started__isnull=False,
            ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

            wait = avg["avg_wait"]

            QueueStatistic.objects.update_or_create(
                queue=queue,
                metric=QueueStatistic.METRIC_AVG_WAIT,
                date=last_sunday,
                defaults={"value": wait.seconds if wait else 0},
            )
