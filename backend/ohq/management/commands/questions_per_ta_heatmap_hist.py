from django.core.management.base import BaseCommand

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Recalculate the new questions asked per TA heatmap statistics using all historic data"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        for queue in queues:
            queue_questions = Question.objects.filter(queue=queue)

            for day in range(7):
                django_day = (day + 1) % 7 + 1

                day_questions = queue_questions.filter(time_asked__week_day=django_day)

                for hour in range(24):
                    num_tas = (
                        day_questions.filter(time_response_started__hour=hour)
                        .distinct("responded_to_by")
                        .count()
                    )
                    num_questions = day_questions.filter(time_asked__hour=hour).count()

                    statistic = num_questions / num_tas if num_tas else num_questions

                    QueueStatistic.objects.update_or_create(
                        queue=queue,
                        metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
                        day=day,
                        hour=hour,
                        defaults={"value": statistic},
                    )
