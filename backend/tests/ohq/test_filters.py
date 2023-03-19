from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from ohq.models import Course, Membership, Question, Queue, Semester


User = get_user_model()


class QuestionSearchFilterTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="Penn Labs", semester=self.semester
        )
        self.professor = User.objects.create(
            username="professor", first_name="Very", last_name="Helpful"
        )
        self.student = User.objects.create(
            username="student", first_name="Really", last_name="Confused"
        )
        Membership.objects.create(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        Membership.objects.create(
            course=self.course, user=self.student, kind=Membership.KIND_STUDENT
        )

        self.queue = Queue.objects.create(name="Queue", course=self.course)
        self.question = Question.objects.create(
            text="help me please, I'm so lost",
            queue=self.queue,
            asked_by=self.student,
            responded_to_by=self.professor,
        )
        self.client.force_authenticate(user=self.professor)

    def test_search_asked_by_first_name(self):
        response = self.client.get(
            reverse("ohq:questionsearch", args=[self.course.id])
            + "?search="
            + self.student.first_name
        )
        body = response.json()
        self.assertEqual(1, body["count"])

    def test_search_asked_by_last_name(self):
        response = self.client.get(
            reverse("ohq:questionsearch", args=[self.course.id])
            + "?search="
            + self.student.last_name
        )
        body = response.json()
        self.assertEqual(1, body["count"])

    def test_search_responded_to_by_first_name(self):
        response = self.client.get(
            reverse("ohq:questionsearch", args=[self.course.id])
            + "?search="
            + self.professor.first_name
        )
        body = response.json()
        self.assertEqual(1, body["count"])

    def test_search_responded_to_by_last_name(self):
        response = self.client.get(
            reverse("ohq:questionsearch", args=[self.course.id])
            + "?search="
            + self.professor.last_name
        )
        body = response.json()
        self.assertEqual(1, body["count"])

    def test_search_text(self):
        response = self.client.get(
            reverse("ohq:questionsearch", args=[self.course.id]) + "?search=lost"
        )
        body = response.json()
        self.assertEqual(1, body["count"])

    def test_search_invalid(self):
        response = self.client.get(
            reverse("ohq:questionsearch", args=[self.course.id]) + "?search=labs"
        )
        body = response.json()
        self.assertEqual(0, body["count"])
