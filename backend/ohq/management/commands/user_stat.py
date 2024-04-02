from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from ohq.models import Profile, Course, Question
from ohq.statistics import (
    user_calculate_questions_asked,
    user_calculate_questions_answered,
    user_calculate_time_helped,
    user_calculate_time_helping,
    user_calculate_students_helped,
)
from django.db.models import Q




class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, profiles, courses, earliest_date):
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        active_users_today = set()

        for course in courses:
            if not earliest_date:
                course_questions = Question.objects.filter(queue__course=course)
                earliest_date = (
                    timezone.template_localtime(
                        course_questions.earliest("time_asked").time_asked
                    ).date()
                    if course_questions
                    else yesterday
                )

            questions_queryset = Question.objects.filter(queue__course=course, time_asked__gte=earliest_date)
            users_union = (
                Profile.objects.filter(
                    Q(id__in=questions_queryset.values_list("asked_by", flat=True)) |
                    Q(id__in=questions_queryset.values_list("responded_to_by", flat=True))
                )
            )

            for user in users_union:
                    user_calculate_questions_asked(user.user)
                    user_calculate_questions_answered(user.user)
                    user_calculate_time_helped(user.user)
                    user_calculate_time_helping(user.user)
                    user_calculate_students_helped(user.user)


    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            courses = Course.objects.all()
            profiles = Profile.objects.all()
            earliest_date = None
        else: 
            courses = Course.objects.filter(archived=False)
            profiles = Profile.objects.all()
            earliest_date = timezone.now().date() - timedelta(days=1)

        self.calculate_statistics(profiles, courses, earliest_date)

        