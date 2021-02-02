from ohq.management.commands.queue_weekly_stat import WeeklyCommand
from ohq.statistics import calculate_num_questions_ans


class Command(WeeklyCommand):
    help = "Calculates the number of questions answered weekly for each queue"

    def perform_computation(self, queue, prev_sunday, coming_saturday):
        calculate_num_questions_ans(queue, prev_sunday, coming_saturday)
