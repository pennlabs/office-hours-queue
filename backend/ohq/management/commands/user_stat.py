from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import logging

from ohq.models import Profile, Course, Question
from ohq.statistics import (
    user_calculate_questions_asked,
    user_calculate_questions_answered,
    user_calculate_time_helped,
    user_calculate_time_helping,
    user_calculate_students_helped,
)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, profiles, courses, earliest_date):
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        active_users_today = set()

        for course in courses:
            logger.debug("course here is", course)
            if earliest_date:
                date = earliest_date
            else: 
                course_questions = Question.objects.filter(queue__course=course)
                date = (
                    timezone.template_localtime(
                        course_questions.earliest("time_asked").time_asked
                    ).date()
                    if course_questions
                    else yesterday
                )

            course_questions = Question.objects.filter(queue__course=course, time_asked__gte=date)
            for q in course_questions:
                active_users_today.add(q.asked_by)
                active_users_today.add(q.responded_to_by)

        for profile in profiles:
            if profile.user in active_users_today:
                user_calculate_questions_asked(profile.user)
                user_calculate_questions_answered(profile.user)
                user_calculate_time_helped(profile.user)
                user_calculate_time_helping(profile.user)
                user_calculate_students_helped(profile.user)


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

        