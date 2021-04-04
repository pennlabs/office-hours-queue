from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, F, Sum

from ohq.models import Question, Queue, Course
from ohq.statistics import (
    calculate_student_most_questions_asked,
    calculate_student_most_time_being_helped,
    calculate_instructor_most_questions_answered,
    calculate_instructor_most_time_helping
)


class Command(BaseCommand):
    def calculate_statistics(self, courses):

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_week = yesterday - timezone.timedelta(days=7)
        for course in courses:
            calculate_student_most_questions_asked(course, yesterday)
            calculate_student_most_time_being_helped(course, yesterday)
            calculate_instructor_most_questions_answered(course, yesterday)
            calculate_instructor_most_time_helping(course, yesterday)
            # Doesn't take into account ties

            student_most_questions_asked = (Question.objects.filter(queue__course=course, 
                                                                time_responded_to__gt=last_week,
                                                                status=Question.STATUS_ANSWERED)
                                                            .values('asked_by')
                                                            .annotate(questions_asked=Count('asked_by'))
                                                            .order_by('-questions_asked')[:5])

            student_most_time_spent = (Question.objects.filter(queue__course=course, 
                                                                time_responded_to__gt=last_week,
                                                                status=Question.STATUS_ANSWERED)
                                                        .values('asked_by')
                                                        .annotate(question_duration=Sum(F('time_responded_to') - F('time_response_started')))
                                                        .order_by('-question_duration')[:5])

            instructor_most_questions_answered = (Question.objects.filter(queue__course=course, 
                                                                            time_responded_to__gt=last_week,
                                                                            status=Question.STATUS_ANSWERED)
                                                                .values('responded_to_by')
                                                                .annotate(questions_answered=Count('responded_to_by'))
                                                                .order_by('-questions_answered')[:5])
            instructor_most_time_spent = (Question.objects.filter(queue__course=course, 
                                                                time_responded_to__gt=last_week,
                                                                status=Question.STATUS_ANSWERED)
                                                            .values('responded_to_by')
                                                            .annotate(question_duration=Sum(F('time_responded_to') - F('time_response_started')))
                                                            .order_by('-question_duration')[:5])

            # print(student_most_questions_asked)
            # print()
            # print(student_most_time_spent)
            # print()
            # print(instructor_most_questions_answered)
            # print()
            # print(instructor_most_time_spent)

            
    def handle(self, *args, **kwargs):
        courses = Course.objects.filter(archived=False)
        # print(courses)
        self.calculate_statistics(courses)
