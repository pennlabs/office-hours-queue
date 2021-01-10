from django.db.models import Avg, F

from ohq.management.commands.queue_weekly_stat import WeeklyCommand
from ohq.models import Question, QueueStatistic


class Command(WeeklyCommand):
    help = "Calculates average wait time for queues"

    def perform_computation(self, queue, prev_sunday, coming_sunday):
        avg = Question.objects.filter(
            queue=queue,
            time_asked__date__range=[prev_sunday, coming_sunday],
            time_response_started__isnull=False,
        ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

        wait = avg["avg_wait"]

        QueueStatistic.objects.update_or_create(
            queue=queue,
            metric=QueueStatistic.METRIC_AVG_WAIT,
            date=prev_sunday,
            defaults={"value": wait.seconds if wait else 0},
        )
