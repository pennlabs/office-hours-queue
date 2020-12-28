from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the number of questions answered this week for each queue"

    def handle(self, *args, **kwargs):
        queues = Queue.objects.filter(archived=False)

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

        for queue in queues:
            num_questions = Question.objects.filter(
                queue=queue,
                status=Question.STATUS_ANSWERED,
                time_responded_to__date__range=[last_sunday, next_sunday],
            ).count()

            QueueStatistic.objects.update_or_create(
                queue=queue,
                metric=QueueStatistic.METRIC_NUM_ANSWERED,
                date=last_sunday,
                defaults={"value": num_questions},
            )
