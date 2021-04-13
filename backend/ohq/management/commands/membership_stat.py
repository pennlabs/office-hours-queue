from django.core.management.base import BaseCommand

from ohq.models import Membership, Question
from ohq.statistics import (
    calculate_instructor_students_per_hour,
    calculate_instructor_time_helping,
    calculate_student_time_helped,
    calculate_student_time_waiting,
)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--hist", action="store_true", help="Calculate all historic statistics")

    def calculate_statistics(self, memberships):
        for membership in memberships:
            if membership.kind == Membership.KIND_STUDENT:
                questions_asked = Question.objects.filter(
                    asked_by=membership.user,
                    status=Question.STATUS_ANSWERED,
                    queue__course=membership.course,
                )
                if questions_asked:
                    calculate_student_time_waiting(
                        membership.user, questions_asked, membership.course
                    )
                    calculate_student_time_helped(
                        membership.user, questions_asked, membership.course
                    )
            else:
                questions_answered = Question.objects.filter(
                    responded_to_by=membership.user,
                    status=Question.STATUS_ANSWERED,
                    queue__course=membership.course,
                )
                if questions_answered:
                    calculate_instructor_time_helping(
                        membership.user, questions_answered, membership.course
                    )
                    calculate_instructor_students_per_hour(
                        membership.user, questions_answered, membership.course
                    )

    def handle(self, *args, **kwargs):
        if kwargs["hist"]:
            memberships = Membership.objects.all()
        else:
            memberships = Membership.objects.filter(course__archived=False)
        self.calculate_statistics(memberships)
