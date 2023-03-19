from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from ohq.models import Course, Membership, Question, Queue, Semester
from ohq.tasks import sendUpNextNotificationTask


User = get_user_model()


@patch("ohq.tasks.sendUpNextNotification")
class sendUpNextNotificationTaskTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="Penn Labs", semester=self.semester
        )
        self.queue = Queue.objects.create(name="Queue", course=self.course)

        self.ta = User.objects.create(username="ta")
        self.student_one = User.objects.create(username="student_one")
        self.student_two = User.objects.create(username="student_two")
        self.student_three = User.objects.create(username="student_three")
        self.student_four = User.objects.create(username="student_four")
        Membership.objects.create(course=self.course, user=self.ta, kind=Membership.KIND_TA)
        Membership.objects.create(
            course=self.course, user=self.student_one, kind=Membership.KIND_STUDENT
        )
        Membership.objects.create(
            course=self.course, user=self.student_two, kind=Membership.KIND_STUDENT
        )
        Membership.objects.create(
            course=self.course, user=self.student_three, kind=Membership.KIND_STUDENT
        )
        Membership.objects.create(
            course=self.course, user=self.student_four, kind=Membership.KIND_STUDENT
        )
        Question.objects.create(queue=self.queue, asked_by=self.student_one, text="Q1")
        Question.objects.create(queue=self.queue, asked_by=self.student_two, text="Q2")
        Question.objects.create(queue=self.queue, asked_by=self.student_three, text="Q3")
        Question.objects.create(queue=self.queue, asked_by=self.student_four, text="Q4")

    def test_small_queue(self, mock_send):
        """
        Ensure a text is not sent when less than 3 questions are in the queue.
        """

        Question.objects.all().first().delete()
        Question.objects.all().first().delete()
        sendUpNextNotificationTask.s(self.queue.id).apply()
        mock_send.assert_not_called()

    def test_should_not_send(self, mock_send):
        """
        Ensure a text is not sent when the 3rd question shouldn't be send a notification.
        """

        sendUpNextNotificationTask.s(self.queue.id).apply()
        mock_send.assert_not_called()

    def test_not_verified(self, mock_send):
        """
        Ensure a text is not sent when the person who asked the 3rd question hasn't verified
        (or added) a phone number.
        """

        question = Question.objects.get(asked_by=self.student_three)
        question.should_send_up_soon_notification = True
        question.save()
        sendUpNextNotificationTask.s(self.queue.id).apply()
        mock_send.assert_not_called()

    def test_send(self, mock_send):
        """
        Send an notification SMS when all criteria is met
        """

        self.student_three.profile.sms_verified = True
        phone_number = "+15555555555"
        self.student_three.profile.phone_number = phone_number
        self.student_three.save()
        question = Question.objects.get(asked_by=self.student_three)
        question.should_send_up_soon_notification = True
        question.save()
        sendUpNextNotificationTask.s(self.queue.id).apply()
        mock_send.assert_called()
        self.assertEqual(1, len(mock_send.mock_calls))
        self.assertEqual(self.student_three, mock_send.call_args[0][0])
        self.assertEqual(self.course, mock_send.call_args[0][1])
