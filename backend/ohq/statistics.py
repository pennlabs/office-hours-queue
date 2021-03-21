from django.db.models import Avg, F
from django.db.models.functions import TruncDate
from django.utils.timezone import localtime

from ohq.models import Question, QueueStatistic


def calculate_avg_queue_wait(queue, prev_sunday, coming_sunday):
    avg = Question.objects.filter(
        queue=queue,
        time_asked__date__range=[prev_sunday, coming_sunday],
        time_response_started__isnull=False,
    ).aggregate(avg_wait=Avg(F("time_response_started") - F("time_asked")))

    wait = avg["avg_wait"]

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_AVG_WAIT,
        date=prev_sunday,
        defaults={"value": wait.seconds if wait else 0},
    )


def calculate_avg_time_helping(queue, prev_sunday, coming_sunday):
    avg = Question.objects.filter(
        queue=queue,
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


def normalize_hour(utc_time):
    """
    Returns the hour of a time and ignores dst/standard time offsets
    """
    updated_time = utc_time + (localtime().dst() - localtime(utc_time).dst())
    return localtime(updated_time).hour


def calculate_wait_time_heatmap(queue, weekday, hour):
    # questions for the given hour and one hour before
    potential_questions = Question.objects.filter(
        queue=queue,
        time_asked__week_day=weekday,
        time_asked__hour__range=[hour - 1, hour],
        time_response_started__isnull=False,
    )

    if hour == 0:
        prev_day_potential = Question.objects.filter(
            queue=queue,
            time_asked__week_day=weekday - 1 if weekday > 1 else 7,
            time_asked__hour=23,
            time_response_started__isnull=False,
        )
        potential_questions = potential_questions.union(prev_day_potential)

    collected_potential_questions = potential_questions.values()

    # make hours between dst and standard time consistent and filter out any hours
    # that don't match
    interval_questions = list(
        filter(
            lambda question: normalize_hour(question["time_asked"]) == hour,
            collected_potential_questions,
        )
    )

    num = sum(
        (question["time_response_started"] - question["time_asked"]).total_seconds()
        for question in interval_questions
    )

    denom = len(interval_questions)

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_HEATMAP_WAIT,
        day=weekday,
        hour=hour,
        defaults={"value": num / denom if denom != 0 else num},
    )


def calculate_num_questions_ans(queue, prev_sunday, coming_saturday):
    num_questions = Question.objects.filter(
        queue=queue,
        status=Question.STATUS_ANSWERED,
        time_responded_to__date__range=[prev_sunday, coming_saturday],
    ).count()

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_NUM_ANSWERED,
        date=prev_sunday,
        defaults={"value": num_questions},
    )


def calculate_num_students_helped(queue, prev_sunday, coming_saturday):
    num_students = (
        Question.objects.filter(
            queue=queue,
            status=Question.STATUS_ANSWERED,
            time_responded_to__date__range=[prev_sunday, coming_saturday],
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


def calculate_questions_per_ta_heatmap(queue, weekday, hour):
    # questions for the given hour and one hour before
    potential_questions = Question.objects.filter(
        queue=queue, time_asked__week_day=weekday, time_asked__hour__range=[hour - 1, hour]
    ).annotate(date=TruncDate("time_asked"))

    if hour == 0:
        prev_day_potential = Question.objects.filter(
            queue=queue, time_asked__week_day=weekday - 1 if weekday > 1 else 7, time_asked__hour=23
        ).annotate(date=TruncDate("time_asked"))
        potential_questions = potential_questions.union(prev_day_potential)

    collected_potential_questions = potential_questions.values()

    # make hours between dst and standard time consistent and filter out any hours
    # that don't match
    interval_questions = list(
        filter(
            lambda question: normalize_hour(question["time_asked"]) == hour,
            collected_potential_questions,
        )
    )

    # question count for each date
    date_question_count = {}

    # unique ta's for each date
    date_tas = {}

    for question in interval_questions:
        if question["date"] in date_question_count:
            date_question_count[question["date"]] += 1
        else:
            date_question_count[question["date"]] = 1
            date_tas[question["date"]] = set()

        if question["responded_to_by_id"] is not None:
            date_tas[question["date"]].add(question["responded_to_by_id"])

    num = 0
    for date in date_question_count:
        num += (
            date_question_count[date] / len(date_tas[date])
            if len(date_tas[date]) != 0
            else date_question_count[date]
        )

    QueueStatistic.objects.update_or_create(
        queue=queue,
        metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
        day=weekday,
        hour=hour,
        defaults={"value": num / len(date_question_count) if len(date_question_count) != 0 else 0},
    )
