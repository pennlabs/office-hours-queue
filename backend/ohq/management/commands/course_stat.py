from django.core.management.base import BaseCommand
from django.utils import timezone

from ohq.models import Course
from ohq.statistics import (
    calculate_instructor_most_questions_answered,
    calculate_instructor_most_time_helping,
    calculate_student_most_questions_asked,
    calculate_student_most_time_being_helped,
)


class Command(BaseCommand):
    def calculate_statistics(self, courses):

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        for course in courses:
            calculate_student_most_questions_asked(course, yesterday)
            calculate_student_most_time_being_helped(course, yesterday)
            calculate_instructor_most_questions_answered(course, yesterday)
            calculate_instructor_most_time_helping(course, yesterday)

    def handle(self, *args, **kwargs):
        courses = Course.objects.filter(archived=False)
        self.calculate_statistics(courses)
