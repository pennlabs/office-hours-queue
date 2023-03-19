from django.core.management.base import BaseCommand

from ohq.queues import calculate_wait_times


class Command(BaseCommand):
    help = "Calculates the estimated wait times of all unarchived queues."

    def handle(self, *args, **kwargs):
        calculate_wait_times()
        self.stdout.write("Updated estimated queue wait times!")
