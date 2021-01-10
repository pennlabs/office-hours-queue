from django.db.models import Avg, F

from ohq.models import Question, QueueStatistic

from .queue_weekly_stat import WeeklyCommand


class Command(WeeklyCommand):
    help = "Calculates the average time helping students"

    def perform_computation(self, queue, prev_sunday, coming_sunday):
        avg = Question.objects.filter(
            queue=queue,
            status=Question.STATUS_ANSWERED,
            time_response_started__date__range=[prev_sunday, coming_sunday],
            time_responded_to__isnull=False,
        ).aggregate(avg_time=Avg(F("time_responded_to") - F("time_response_started")))

        duration = avg["avg_time"]

        QueueStatistic.objects.update_or_create(
            queue=queue,
            metric=QueueStatistic.METRIC_AVG_TIME_HELPING,
            date=prev_sunday,
            defaults={"value": duration.seconds if duration else 0},
        )
