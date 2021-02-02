from ohq.management.commands.queue_weekly_stat import WeeklyCommand
from ohq.statistics import calculate_avg_queue_wait


class Command(WeeklyCommand):
    help = "Calculates average wait time for queues"

    def perform_computation(self, queue, prev_sunday, coming_sunday):
        calculate_avg_queue_wait(queue, prev_sunday, coming_sunday)
