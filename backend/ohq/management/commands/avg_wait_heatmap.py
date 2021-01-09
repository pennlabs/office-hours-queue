from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculate the average wait-time heatmap statistics"

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
                    interval_avg = weekday_questions.filter(
                        time_asked__hour=hour, time_response_started__isnull=False
                    ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

                    interval_avg_wait = interval_avg["avg_wait"]

                    QueueStatistic.objects.update_or_create(
                        queue=queue,
                        metric=QueueStatistic.METRIC_HEATMAP_WAIT,
                        day=weekday,
                        hour=hour,
                        defaults={"value": interval_avg_wait.seconds if interval_avg_wait else 0},
                    )

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            weekdays = [i for i in range(7)]
        else:
            queues = Queue.objects.filter(archived=False)

            yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
            weekdays = [yesterday.weekday()]

        Command.calculate_statistics(queues, weekdays)
