from ohq.models import Question, QueueStatistic

from .queue_heatmap_stat import HeatmapCommand


class Command(HeatmapCommand):
    help = "Calculates questions asked per TA heatmap statistics"

    def perform_computation(self, queue, weekday, hour):
        django_weekday = (weekday + 1) % 7 + 1
        interval_questions = Question.objects.filter(
            queue=queue, time_asked__week_day=django_weekday, time_asked__hour=hour
        )

        num_tas = interval_questions.distinct("responded_to_by").count()

        num_questions = interval_questions.count()

        statistic = num_questions / num_tas if num_tas else num_questions

        QueueStatistic.objects.update_or_create(
            queue=queue,
            metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
            day=weekday,
            hour=hour,
            defaults={"value": statistic},
        )
