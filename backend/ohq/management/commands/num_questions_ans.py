from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the number of questions answered this week for queues and puts them in queue statistics"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        today = timezone.datetime.today().date()
        last_sunday = today - timezone.timedelta(days=(today.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

        for queue in queues:
            num_questions = Question.objects.filter(
                queue=queue,
                status=Question.STATUS_ANSWERED,
                time_responded_to__range=[last_sunday, next_sunday],
            ).count()

            QueueStatistic.objects.update_or_create(
                queue=queue,
                metric=QueueStatistic.METRIC_NUM_ANSWERED,
                date=last_sunday,
                defaults={"value": num_questions},
            )
