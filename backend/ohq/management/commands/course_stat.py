from django.core.management.base import BaseCommand
from django.utils import timezone

from collections import defaultdict
from django.db.models import Count, F, Sum

from ohq.models import Question, Queue, Course
from ohq.statistics import (
    calculate_avg_queue_wait,
    calculate_avg_time_helping,
    calculate_num_questions_ans,
    calculate_num_students_helped,
)


class Command(BaseCommand):
    def calculate_statistics(self, courses):

        last_week = timezone.datetime.today().date() - timezone.timedelta(days=7)
        for course in courses:
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
                                                                .values('answered_by')
                                                                .annotate(questions_answered=Count('answered_by'))
                                                                .order_by('-questions_answered')[:5])
            instructor_most_time_spent = (Question.objects.filter(queue__course=course, 
                                                                time_responded_to__gt=last_week,
                                                                status=Question.STATUS_ANSWERED)
                                                            .values('answered_by')
                                                            .annotate(question_duration=Sum(F('time_responded_to') - F('time_response_started')))
                                                            .order_by('-question_duration')[:5])

            print(student_most_questions_asked)
            print()
            print(student_most_time_spent)
            print()
            print(instructor_most_questions_asked)
            print()
            print(instructor_most_time_spent)

            # for question in student_most_questions_asked:
            #     print(question)
                # user = question.asked_by
                # count = question.questions_asked
                # print(user, count)
            print()

            # students_most_time_spent = question_query.order_by('-question_duration')

            # print(question_query)
            # print('count asked: ', question_query[0].questions_asked)
            # print('asked by: ', question_query[0].asked_by)
            # print('count answered: ', question_query[0].questions_answered)
            # print('answered by: ', question_query[0].responded_to_by)
            # print('answered by: ', question_query[0].question_duration)
                
            # for question in questions:
            #     student_count[question.asked_by][0] += quest
        
            
            
            


        # yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        # last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        # next_sunday = last_sunday + timezone.timedelta(days=7)

        # for queue in queues:
        #     queue_questions = Question.objects.filter(queue=queue)

        #     if earliest_date:
        #         iter_date = earliest_date
        #     else:
        #         iter_date = (
        #             timezone.template_localtime(
        #                 queue_questions.earliest("time_asked").time_asked
        #             ).date()
        #             if queue_questions
        #             else yesterday
        #         )

        #     while iter_date < next_sunday:
        #         prev_sunday = iter_date - timezone.timedelta(days=(iter_date.weekday() + 1) % 7)
        #         coming_saturday = prev_sunday + timezone.timedelta(days=6)

        #         calculate_avg_queue_wait(queue, prev_sunday, coming_saturday)
        #         calculate_avg_time_helping(queue, prev_sunday, coming_saturday)
        #         calculate_num_questions_ans(queue, prev_sunday, coming_saturday)
        #         calculate_num_students_helped(queue, prev_sunday, coming_saturday)

        #         iter_date += timezone.timedelta(days=7)

    def handle(self, *args, **kwargs):
        courses = Course.objects.filter(archived=False)
        # print(courses)
        self.calculate_statistics(courses)
