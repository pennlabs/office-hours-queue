import abc

from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Question, Queue


class WeeklyCommand(BaseCommand):
    __metaclass__ = abc.ABCMeta

    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    @abc.abstractmethod
    def perform_computation(self, queue, prev_sunday, coming_sunday):
        """
        Given questions in a queue, calculate the statistic for the weekly range
        """

    def calculate_statistics(self, queues, earliest_date):
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        next_sunday = last_sunday + timezone.timedelta(days=7)

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

            while iter_date < next_sunday:
                prev_sunday = iter_date - timezone.timedelta(days=(iter_date.weekday() + 1) % 7)
                coming_sunday = prev_sunday + timezone.timedelta(days=7)

                self.perform_computation(queue, prev_sunday, coming_sunday)

                iter_date += timezone.timedelta(days=7)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            earliest_date = None
        else:
            queues = Queue.objects.filter(archived=False)
            earliest_date = timezone.datetime.today().date() - timezone.timedelta(days=1)

        self.calculate_statistics(queues, earliest_date)
