import abc

from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Queue


class HeatmapCommand(BaseCommand):
    __metaclass__ = abc.ABCMeta

    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    @abc.abstractmethod
    def perform_computation(self, queue, weekday, hour):
        """
        Performs the heatmap computation for the given queue, weekday, hour
        """

    def calculate_statistics(self, queues, weekdays):
        """
        Helper function to calculate the heatmap statistics
        """
        for queue in queues:
            for weekday in weekdays:
                for hour in range(24):
                    self.perform_computation(queue, weekday, hour)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            weekdays = [i for i in range(7)]
        else:
            queues = Queue.objects.filter(archived=False)

            # assuming the cron job runs at midnight, we only need to update yesterday's weekday
            yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
            weekdays = [yesterday.weekday()]

        self.calculate_statistics(queues, weekdays)
