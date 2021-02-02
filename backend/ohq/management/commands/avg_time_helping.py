from ohq.management.commands.queue_weekly_stat import WeeklyCommand
from ohq.statistics import calculate_avg_time_helping


class Command(WeeklyCommand):
    help = "Calculates the average time helping students"

    def perform_computation(self, queue, prev_sunday, coming_sunday):
        calculate_avg_time_helping(queue, prev_sunday, coming_sunday)
