from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from ohq.models import Course, Membership, Question, Queue, Semester
from ohq.queues import calculate_wait_times


User = get_user_model()


class generateWaitTimesTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="Penn Labs", semester=self.semester
        )
        self.open_queue = Queue.objects.create(name="Queue", course=self.course, active=True)
        self.closed_queue = Queue.objects.create(
            name="Closed Queue", course=self.course, estimated_wait_time=5
        )

        self.ta = User.objects.create(username="ta")
        self.student = User.objects.create(username="student")
        Membership.objects.create(course=self.course, user=self.ta, kind=Membership.KIND_TA)
        Membership.objects.create(
            course=self.course, user=self.student, kind=Membership.KIND_STUDENT
        )

        self.now = timezone.now()
        q1 = Question.objects.create(
            queue=self.open_queue, asked_by=self.student, text="Q1", time_response_started=self.now,
        )
        q1.time_asked = self.now - timedelta(minutes=3)
        q1.save()
        q2 = Question.objects.create(
            queue=self.open_queue, asked_by=self.student, text="Q2", time_response_started=self.now,
        )
        q2.time_asked = self.now - timedelta(minutes=3)
        q2.save()
        q3 = Question.objects.create(
            queue=self.open_queue, asked_by=self.student, text="Q3", time_response_started=self.now,
        )
        q3.time_asked = self.now - timedelta(minutes=4)
        q3.save()
        q4 = Question.objects.create(
            queue=self.open_queue, asked_by=self.student, text="Q4", time_response_started=self.now,
        )
        q4.time_asked = self.now - timedelta(minutes=6)
        q4.save()

    def test_closed_queue(self):
        """
        Ensure a closed queue's wait time is -1
        """

        calculate_wait_times()
        self.closed_queue.refresh_from_db()
        self.assertEqual(-1, self.closed_queue.estimated_wait_time)

    def test_open_queue_no_questions(self):
        """
        If a queue is open, but doesn't have any questions answered in the last 5 minutes,
        estimated time should be 0
        """

        Question.objects.all().delete()
        first_time = self.open_queue.estimated_wait_time
        calculate_wait_times()
        self.open_queue.refresh_from_db()
        self.assertEqual(first_time, self.open_queue.estimated_wait_time)

    def test_open_queue_with_questions(self):
        """
        If a queue is open, and has answered questions, calculate estimated wait time
        """

        calculate_wait_times()
        self.open_queue.refresh_from_db()
        self.assertEqual(4, self.open_queue.estimated_wait_time)
