from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the number of students helped this week for each queue"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        today = timezone.datetime.today().date()
        last_sunday = today - timezone.timedelta(days=(today.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

        for queue in queues:
            num_students = (
                Question.objects.filter(
                    queue=queue,
                    status=Question.STATUS_ANSWERED,
                    time_responded_to__range=[last_sunday, next_sunday],
                )
                .distinct("asked_by")
                .count()
            )

            QueueStatistic.objects.update_or_create(
                queue=queue,
                metric=QueueStatistic.METRIC_STUDENTS_HELPED,
                date=last_sunday,
                defaults={"value": num_students},
            )
