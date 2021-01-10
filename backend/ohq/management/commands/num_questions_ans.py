from ohq.management.commands.queue_weekly_stat import WeeklyCommand
from ohq.models import Question, QueueStatistic


class Command(WeeklyCommand):
    help = "Calculates the number of questions answered weekly for each queue"

    def perform_computation(self, queue, prev_sunday, coming_sunday):
        num_questions = Question.objects.filter(
            queue=queue,
            status=Question.STATUS_ANSWERED,
            time_responded_to__date__range=[prev_sunday, coming_sunday],
        ).count()

        QueueStatistic.objects.update_or_create(
            queue=queue,
            metric=QueueStatistic.METRIC_NUM_ANSWERED,
            date=prev_sunday,
            defaults={"value": num_questions},
        )
