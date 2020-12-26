from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the average time helping students for the current week"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        today = timezone.datetime.today().date()
        last_sunday = today - timezone.timedelta(days=(today.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

        for queue in queues:
            avg = Question.objects.filter(
                queue=queue,
                status=Question.STATUS_ANSWERED,
                time_responded_to__date__range=[last_sunday, next_sunday],
            ).aggregate(avg_time=Avg(F("time_responded_to") - F("time_response_started")))

            duration = avg["avg_time"]

            QueueStatistic.objects.update_or_create(
                queue=queue,
                metric=QueueStatistic.METRIC_AVG_TIME_HELPING,
                date=last_sunday,
                defaults={"value": duration.seconds if duration else 0},
            )
