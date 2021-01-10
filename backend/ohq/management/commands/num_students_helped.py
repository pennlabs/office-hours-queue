from ohq.management.commands.queue_weekly_stat import WeeklyCommand
from ohq.models import Question, QueueStatistic


class Command(WeeklyCommand):
    help = "Calculates the number of students helped weekly for each queue"

    def perform_computation(self, queue, prev_sunday, coming_sunday):
        num_students = (
            Question.objects.filter(
                queue=queue,
                status=Question.STATUS_ANSWERED,
                time_responded_to__date__range=[prev_sunday, coming_sunday],
            )
            .distinct("asked_by")
            .count()
        )

        QueueStatistic.objects.update_or_create(
            queue=queue,
            metric=QueueStatistic.METRIC_STUDENTS_HELPED,
            date=prev_sunday,
            defaults={"value": num_students},
        )
