from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Course, Question, Queue
from ohq.statistics import (
    course_calculate_instructor_most_questions_answered,
    course_calculate_instructor_most_time_helping,
    course_calculate_student_most_questions_asked,
    course_calculate_student_most_time_being_helped,
)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, courses, earliest_date):
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)

        for course in courses:
            if earliest_date:
                iter_date = earliest_date
            else:
                course_questions = Question.objects.filter(queue__course=course)
                iter_date = (
                    timezone.template_localtime(
                        course_questions.earliest("time_asked").time_asked
                    ).date()
                    if course_questions
                    else yesterday
                )

            # weekday() - monday is 0, sunday is 6 => we want last sunday
            iter_date = iter_date - timezone.timedelta(days=(iter_date.weekday() + 1) % 7)

            while iter_date <= yesterday:
                course_calculate_student_most_questions_asked(course, iter_date)
                course_calculate_student_most_time_being_helped(course, iter_date)
                course_calculate_instructor_most_questions_answered(course, iter_date)
                course_calculate_instructor_most_time_helping(course, iter_date)

                iter_date += timezone.timedelta(days=7)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            courses = Course.objects.all()
            earliest_date = None
        else:
            courses = Course.objects.filter(archived=False)
            earliest_date = timezone.datetime.today().date() - timezone.timedelta(days=1)

        self.calculate_statistics(courses, earliest_date)
