from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Queue
from ohq.statistics import calculate_questions_per_ta_heatmap, calculate_wait_time_heatmap


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, queues, weekdays):
        """
        Helper function to calculate the heatmap statistics
        """
        for queue in queues:
            for weekday in weekdays:
                for hour in range(24):
                    calculate_questions_per_ta_heatmap(queue, weekday, hour)
                    calculate_wait_time_heatmap(queue, weekday, hour)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            weekdays = [i for i in range(1, 8)]
        else:
            queues = Queue.objects.filter(archived=False)

            # assuming the cron job runs at midnight, we only need to update yesterday's weekday
            yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
            weekdays = [(yesterday.weekday() + 1) % 7 + 1]

        self.calculate_statistics(queues, weekdays)
