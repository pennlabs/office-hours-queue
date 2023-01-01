from django.core.management.base import BaseCommand

from ohq.models import Course, Membership, Question
from ohq.statistics import (
    membership_calculate_instructor_time_helping,
    membership_calculate_instructor_total_questions,
    membership_calculate_instructor_total_time_helping,
    membership_calculate_student_time_helped,
    membership_calculate_student_time_waiting,
    membership_calculate_student_total_questions,
    membership_calculate_student_total_time_helped,
    membership_calculate_student_total_time_waiting,
)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, courses):
        for course in courses:
            membership_calculate_student_time_waiting(course)
            membership_calculate_student_time_helped(course)
            membership_calculate_instructor_time_helping(course)
            membership_calculate_student_total_time_helped(course)
            membership_calculate_student_total_time_waiting(course)
            membership_calculate_student_total_questions(course)
            membership_calculate_instructor_total_time_helping(course)
            membership_calculate_instructor_total_questions(course)

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            courses = Course.objects.all()
        else:
            courses = Course.objects.filter(archived=False)
        self.calculate_statistics(courses)
