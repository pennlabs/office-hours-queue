from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Question, Queue
from ohq.statistics import (
    queue_calculate_avg_time_helping,
    queue_calculate_avg_wait,
    queue_calculate_num_questions_ans,
    queue_calculate_num_students_helped,
)


class Command(BaseCommand):
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

                queue_calculate_avg_wait(queue, iter_date)
                queue_calculate_avg_time_helping(queue, iter_date)
                queue_calculate_num_questions_ans(queue, iter_date)
                queue_calculate_num_students_helped(queue, iter_date)

                iter_date += timezone.timedelta(days=1)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            queues = Queue.objects.all()
            earliest_date = None
        else:
            queues = Queue.objects.filter(archived=False)
            earliest_date = timezone.datetime.today().date() - timezone.timedelta(days=1)

        self.calculate_statistics(queues, earliest_date)
