from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester


User = get_user_model()


class ProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="user")

    def test_str(self):
        self.assertEqual(str(self.user.profile), str(self.user))


class CourseTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )

    def test_str(self):
        self.assertEqual(
            str(self.course),
            f"{self.course.department} {self.course.course_code}: {self.course.semester}",
        )


class MembershipTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.user = User.objects.create(username="user", email="example@example.com")
        self.membership = Membership.objects.create(
            course=course, user=self.user, kind=Membership.KIND_PROFESSOR
        )

    def test_kind_to_pretty(self):
        self.assertEqual(self.membership.kind_to_pretty(), "Professor")

    def test_str(self):
        mem = self.membership
        self.assertEqual(
            str(mem), f"<Membership: {mem.user} - {mem.course} ({mem.kind_to_pretty()})>",
        )

    def test_send_email(self):
        self.membership.send_email()
        self.assertEqual(1, len(mail.outbox))
        email = mail.outbox[0]
        self.assertEqual(self.user.email, email.to[0])


class MembershipInviteTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.invite = MembershipInvite.objects.create(
            course=course, email="me@example.com", kind=Membership.KIND_PROFESSOR
        )

    def test_kind_to_pretty(self):
        self.assertEqual(self.invite.kind_to_pretty(), "Professor")

    def test_str(self):
        inv = self.invite
        self.assertEqual(
            str(inv), f"<MembershipInvite: {inv.email} - {inv.course} ({inv.kind_to_pretty()})>",
        )

    def test_send_email(self):
        self.invite.send_email()
        self.assertEqual(1, len(mail.outbox))
        email = mail.outbox[0]
        self.assertEqual(self.invite.email, email.to[0])


class QueueTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)

    def test_str(self):
        self.assertEqual(str(self.queue), f"{self.queue.course}: {self.queue.name}")


class QuestionTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        queue = Queue.objects.create(name="Queue", course=course)
        self.question = Question.objects.create(text="Question?", queue=queue)

    def test_str(self):
        # TODO: write this
        pass


class SemesterTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)

    def test_term_to_pretty(self):
        self.assertEqual(self.semester.term_to_pretty(), self.semester.term.title())

    def test_str(self):
        self.assertEqual(str(self.semester), f"{self.semester.year} - {self.semester.term.title()}")
