from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates questions asked per TA heatmap statistics"

    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    @staticmethod
    def calculate_statistics(queues, weekdays):
        """
        Helper function to calculate the heatmap statistics
        """
        for queue in queues:
            for weekday in weekdays:
                # django weekday is diff from normal datetime weekdays
                django_weekday = (weekday + 1) % 7 + 1
                weekday_questions = Question.objects.filter(
                    queue=queue, time_asked__week_day=django_weekday
                )

                for hour in range(24):
                    num_tas = (
                        weekday_questions.filter(time_response_started__hour=hour)
                        .distinct("responded_to_by")
                        .count()
                    )
                    num_questions = weekday_questions.filter(time_asked__hour=hour).count()

                    statistic = num_questions / num_tas if num_tas else num_questions

                    QueueStatistic.objects.update_or_create(
                        queue=queue,
                        metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
                        day=weekday,
                        hour=hour,
                        defaults={"value": statistic},
                    )

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            weekdays = [i for i in range(7)]
        else:
            queues = Queue.objects.filter(archived=False)

            # assuming the cron job runs daily at midnight, we only need to update yesterday's weekday
            yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
            weekdays = [yesterday.weekday()]

        Command.calculate_statistics(queues, weekdays)
