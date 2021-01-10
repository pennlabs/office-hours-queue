from django.db.models import Avg, F

from ohq.models import Question, QueueStatistic

from .queue_heatmap_stat import HeatmapCommand


class Command(HeatmapCommand):
    help = "Calculate the average wait-time heatmap statistics"

    def perform_computation(self, queue, weekday, hour):
        django_weekday = (weekday + 1) % 7 + 1

        interval_avg = Question.objects.filter(
            queue=queue,
            time_asked__week_day=django_weekday,
            time_asked__hour=hour,
            time_response_started__isnull=False,
        ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

        interval_avg_wait = interval_avg["avg_wait"]

        QueueStatistic.objects.update_or_create(
            queue=queue,
            metric=QueueStatistic.METRIC_HEATMAP_WAIT,
            day=weekday,
            hour=hour,
            defaults={"value": interval_avg_wait.seconds if interval_avg_wait else 0},
        )
