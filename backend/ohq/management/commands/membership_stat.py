from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from ohq.models import Membership, Question
from ohq.statistics import calculate_instructor_avg_time_stats, calculate_student_avg_time_stats


class Command(BaseCommand):
    def calculate_statistics(self, users):

        # Iterate through all the users, building membership stats for each user
        for user in users:
            memberships = Membership.objects.filter(user=user, course__archived=False)
            for membership in memberships:
                questions_asked = Question.objects.filter(
                    asked_by=user, status=Question.STATUS_ANSWERED, queue__course=membership.course
                )
                questions_answered = Question.objects.filter(
                    responded_to_by=user,
                    status=Question.STATUS_ANSWERED,
                    queue__course=membership.course,
                )
                if questions_asked:
                    calculate_student_avg_time_stats(user, questions_asked, membership.course)
                if questions_answered:
                    calculate_instructor_avg_time_stats(user, questions_answered, membership.course)

    def handle(self, *args, **kwargs):
        User = get_user_model()
        users = User.objects.filter(is_active=True)
        self.calculate_statistics(users)
