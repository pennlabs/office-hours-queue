from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
import datetime

from ohq.models import Profile, Course, Question
from ohq.statistics import (
    user_calculate_questions_asked,
    user_calculate_questions_answered,
    user_calculate_time_helped,
    user_calculate_time_helping,
    user_calculate_students_helped,
)
from django.db.models import Q

from django.contrib.auth import get_user_model

User = get_user_model()




class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, courses, earliest_date):
        for course in courses:

            questions_queryset = Question.objects.filter(queue__course=course, time_asked__gte=earliest_date)
            users_union = (
                User.objects.filter(
                    Q(id__in=questions_queryset.values_list("asked_by", flat=True)) |
                    Q(id__in=questions_queryset.values_list("responded_to_by", flat=True))
                )
            )

            for user in users_union:
                    user_calculate_questions_asked(user)
                    user_calculate_questions_answered(user)
                    user_calculate_time_helped(user)
                    user_calculate_time_helping(user)
                    user_calculate_students_helped(user)


    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            courses = Course.objects.all()
            earliest_date = timezone.make_aware(datetime.datetime.utcfromtimestamp(0))
        else: 
            courses = Course.objects.filter(archived=False)
            earliest_date = timezone.now().date() - timedelta(days=1)

        self.calculate_statistics(courses, earliest_date)

        