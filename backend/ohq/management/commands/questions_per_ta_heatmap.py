from ohq.management.commands.queue_heatmap_stat import HeatmapCommand
from ohq.statistics import calculate_questions_per_ta_heatmap


class Command(HeatmapCommand):
    help = "Calculates questions asked per TA heatmap statistics"

    def perform_computation(self, queue, weekday, hour):
        calculate_questions_per_ta_heatmap(queue, weekday, hour)
