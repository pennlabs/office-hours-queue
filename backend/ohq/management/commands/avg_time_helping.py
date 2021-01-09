from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the average time helping students"

    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    @staticmethod
    def calculate_statistics(queues, earliest_date):
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

        for queue in queues:
            queue_questions = Question.objects.filter(queue=queue)

            if earliest_date:
                iter_date = earliest_date
            else:
                iter_date = (
                    queue_questions.earliest("time_asked").time_asked.date()
                    if queue_questions
                    else yesterday
                )

            while iter_date < next_sunday:
                prev_sunday = iter_date - timezone.timedelta(days=(iter_date.weekday() + 1) % 7)
                coming_sunday = prev_sunday + timezone.timedelta(days=7)

                avg = queue_questions.filter(
                    status=Question.STATUS_ANSWERED,
                    time_response_started__date__range=[prev_sunday, coming_sunday],
                    time_responded_to__isnull=False,
                ).aggregate(avg_time=Avg(F("time_responded_to") - F("time_response_started")))

                duration = avg["avg_time"]

                QueueStatistic.objects.update_or_create(
                    queue=queue,
                    metric=QueueStatistic.METRIC_AVG_TIME_HELPING,
                    date=prev_sunday,
                    defaults={"value": duration.seconds if duration else 0},
                )

                iter_date += timezone.timedelta(days=7)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            earliest_date = None
        else:
            queues = Queue.objects.filter(archived=False)
            earliest_date = timezone.datetime.today().date() - timezone.timedelta(days=1)

        Command.calculate_statistics(queues, earliest_date)
