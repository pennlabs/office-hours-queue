from ohq.management.commands.queue_heatmap_stat import HeatmapCommand
from ohq.statistics import calculate_wait_time_heatmap


class Command(HeatmapCommand):
    help = "Calculate the average wait-time heatmap statistics"

    def perform_computation(self, queue, weekday, hour):
        calculate_wait_time_heatmap(queue, weekday, hour)
