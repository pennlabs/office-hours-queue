from django.core.management.base import BaseCommand
from django.db.models import Avg, F
from django.utils import timezone

from ohq.models import Question, Queue, QueueStatistic


class Command(BaseCommand):
    help = "Calculates the average wait time for queues each day"

    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, queues, earliest_date):
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)

        for queue in queues:
            queue_questions = Question.objects.filter(queue=queue)

            if earliest_date:
                iter_date = earliest_date
            else:
                iter_date = (
                    timezone.template_localtime(
                        queue_questions.earliest("time_asked").time_asked
                    ).date()
                    if queue_questions
                    else yesterday
                )

            while iter_date <= yesterday:
                avg = queue_questions.filter(
                    time_asked__date=iter_date, time_response_started__isnull=False
                ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

                wait = avg["avg_wait"]

                QueueStatistic.objects.update_or_create(
                    queue=queue,
                    metric=QueueStatistic.METRIC_LIST_WAIT_TIME_DAYS,
                    date=iter_date,
                    defaults={"value": wait.seconds if wait else 0},
                )

                iter_date += timezone.timedelta(days=1)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            earliest_date = None
        else:
            queues = Queue.objects.filter(archived=False)
            earliest_date = timezone.datetime.today().date() - timezone.timedelta(days=1)

        self.calculate_statistics(queues, earliest_date)
