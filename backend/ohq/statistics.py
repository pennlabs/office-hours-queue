from django.db.models import Avg, Case, Count, F, When
from django.db.models.functions import TruncDate

from ohq.models import Question, QueueStatistic


def calculate_avg_queue_wait(queue, date):
    avg = Question.objects.filter(
        queue=queue,
        time_asked__date=date,
        time_response_started__isnull=False,
    ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

    wait = avg["avg_wait"]

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_AVG_WAIT,
        date=date,
        defaults={"value": wait.seconds if wait else 0},
    )


def calculate_avg_time_helping(queue, date):
    avg = Question.objects.filter(
        queue=queue,
        status=Question.STATUS_ANSWERED,
        time_response_started__date=date,
        time_responded_to__isnull=False,
    ).aggregate(avg_time=Avg(F("time_responded_to") - F("time_response_started")))

    duration = avg["avg_time"]

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_AVG_TIME_HELPING,
        date=date,
        defaults={"value": duration.seconds if duration else 0},
    )


def calculate_wait_time_heatmap(queue, weekday, hour):
    interval_avg = Question.objects.filter(
        queue=queue,
        time_asked__week_day=weekday,
        time_asked__hour=hour,
        time_response_started__isnull=False,
    ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

    interval_avg_wait = interval_avg["avg_wait"]

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_HEATMAP_WAIT,
        day=weekday,
        hour=hour,
        defaults={"value": interval_avg_wait.seconds if interval_avg_wait else 0},
    )


def calculate_num_questions_ans(queue, date):
    num_questions = Question.objects.filter(
        queue=queue,
        status=Question.STATUS_ANSWERED,
        time_responded_to__date=date,
    ).count()

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_NUM_ANSWERED,
        date=date,
        defaults={"value": num_questions},
    )


def calculate_num_students_helped(queue, date):
    num_students = (
        Question.objects.filter(
            queue=queue,
            status=Question.STATUS_ANSWERED,
            time_responded_to__date=date,
        )
        .distinct("asked_by")
        .count()
    )

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_STUDENTS_HELPED,
        date=date,
        defaults={"value": num_students},
    )


def calculate_questions_per_ta_heatmap(queue, weekday, hour):
    interval_stats = (
        Question.objects.filter(queue=queue, time_asked__week_day=weekday, time_asked__hour=hour)
        .annotate(date=TruncDate("time_asked"))
        .values("date")
        .annotate(
            questions=Count("date", distinct=False), tas=Count("responded_to_by", distinct=True),
        )
        .annotate(
            q_per_ta=Case(When(tas=0, then=F("questions")), default=1.0 * F("questions") / F("tas"))
        )
        .aggregate(avg=Avg(F("q_per_ta")))
    )

    statistic = interval_stats["avg"]

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
        day=weekday,
        hour=hour,
        defaults={"value": statistic if statistic else 0},
    )
