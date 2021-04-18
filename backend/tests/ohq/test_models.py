from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.utils import timezone

from ohq.models import (
    Course,
    Membership,
    MembershipInvite,
    MembershipStatistic,
    Question,
    Queue,
    QueueStatistic,
    Semester,
    Tag,
)


User = get_user_model()


class ProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="user")

    def test_str(self):
        self.assertEqual(str(self.user.profile), str(self.user))


class TagTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        self.tag = Tag.objects.create(name="Test Tag", course=self.course)

    def test_str(self):
        self.assertEqual(str(self.tag), f"{self.course}: Test Tag")


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

    def test_is_leadership(self):
        self.assertTrue(self.membership.is_leadership)

    def test_is_ta(self):
        self.assertTrue(self.membership.is_ta)

    def test_str(self):
        mem = self.membership
        self.assertEqual(
            str(mem), f"<Membership: {mem.user} - {mem.course} ({mem.kind_to_pretty()})>"
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
            str(inv), f"<MembershipInvite: {inv.email} - {inv.course} ({inv.kind_to_pretty()})>"
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
        self.queue = Queue.objects.create(name="Queue", course=course)
        self.user = User.objects.create(username="user", email="example@example.com")
        self.question = Question.objects.create(
            text="Question?", queue=self.queue, asked_by=self.user
        )

    def test_str(self):
        self.assertEqual(str(self.question), f"{self.queue}: Asked by {self.user}")


class SemesterTestCase(TestCase):
    def setUp(self):
        self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)

    def test_term_to_pretty(self):
        self.assertEqual(self.semester.term_to_pretty(), self.semester.term.title())

    def test_str(self):
        self.assertEqual(str(self.semester), f"{self.semester.term.title()} {self.semester.year}")


class MembershipStatisticTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        self.course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.user = User.objects.create_user("user", "user@a.com", "user")

        self.student_avg_time_helped = MembershipStatistic.objects.create(
            course=self.course,
            user=self.user,
            metric=MembershipStatistic.METRIC_STUDENT_AVG_TIME_HELPED,
            value=100.00,
        )

        self.student_avg_time_waiting = MembershipStatistic.objects.create(
            course=self.course,
            user=self.user,
            metric=MembershipStatistic.METRIC_STUDENT_AVG_TIME_WAITING,
            value=100.00,
        )

        self.instructor_avg_time_helping = MembershipStatistic.objects.create(
            course=self.course,
            user=self.user,
            metric=MembershipStatistic.METRIC_INSTR_AVG_TIME_HELPING,
            value=100.00,
        )

        self.instructor_avg_students_per_hour = MembershipStatistic.objects.create(
            course=self.course,
            user=self.user,
            metric=MembershipStatistic.METRIC_INSTR_AVG_STUDENTS_PER_HOUR,
            value=100.00,
        )

    def test_metric_to_pretty(self):

        self.assertEqual(
            self.student_avg_time_helped.metric_to_pretty(), "Student: Average time being helped"
        )

        self.assertEqual(
            self.student_avg_time_waiting.metric_to_pretty(),
            "Student: Average time waiting for help",
        )

        self.assertEqual(
            self.instructor_avg_time_helping.metric_to_pretty(),
            "Instructor: Average time helping per question",
        )

        self.assertEqual(
            self.instructor_avg_students_per_hour.metric_to_pretty(),
            "Instructor: Average number of students helped per hour",
        )

    def test_str(self):

        self.assertEqual(
            str(self.student_avg_time_helped),
            f"{self.course}: {self.user}: Student: Average time being helped",
        )

        self.assertEqual(
            str(self.student_avg_time_waiting),
            f"{self.course}: {self.user}: Student: Average time waiting for help",
        )

        self.assertEqual(
            str(self.instructor_avg_time_helping),
            f"{self.course}: {self.user}: Instructor: Average time helping per question",
        )

        self.assertEqual(
            str(self.instructor_avg_students_per_hour),
            f"{self.course}: {self.user}: Instructor: Average number of students helped per hour",
        )


class QueueStatisticTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)

        self.heatmap_queue_statistic = QueueStatistic.objects.create(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_WAIT,
            value=100.00,
            day=QueueStatistic.DAY_MONDAY,
            hour=0,
        )
        today = timezone.datetime.today().date()

        self.avg_wait_time_queue_statistic = QueueStatistic.objects.create(
            queue=self.queue,
            metric=QueueStatistic.METRIC_AVG_WAIT,
            value=150.00,
            date=today - timezone.timedelta(days=1),
        )

        self.num_questions_answered_queue_statistic = QueueStatistic.objects.create(
            queue=self.queue,
            metric=QueueStatistic.METRIC_NUM_ANSWERED,
            value=10.00,
            date=today - timezone.timedelta(days=1),
        )

        self.num_students_helped_queue_statistic = QueueStatistic.objects.create(
            queue=self.queue,
            metric=QueueStatistic.METRIC_STUDENTS_HELPED,
            value=50.00,
            date=today - timezone.timedelta(days=1),
        )

        self.avg_time_helping_queue_statistic = QueueStatistic.objects.create(
            queue=self.queue,
            metric=QueueStatistic.METRIC_AVG_TIME_HELPING,
            value=120.00,
            date=today - timezone.timedelta(days=1),
        )

    def test_str(self):
        self.assertEqual(
            str(self.heatmap_queue_statistic),
            f"{self.queue}: {self.heatmap_queue_statistic.get_metric_display()} "
            f"{self.heatmap_queue_statistic.get_day_display()} "
            f"{self.heatmap_queue_statistic.hour}:00 - {self.heatmap_queue_statistic.hour+1}:00",
        )

        self.assertEqual(
            str(self.avg_wait_time_queue_statistic),
            f"{self.queue}: {self.avg_wait_time_queue_statistic.get_metric_display()}",
        )

        self.assertEqual(
            str(self.num_questions_answered_queue_statistic),
            f"{self.queue}: {self.num_questions_answered_queue_statistic.get_metric_display()}",
        )

        self.assertEqual(
            str(self.num_students_helped_queue_statistic),
            f"{self.queue}: {self.num_students_helped_queue_statistic.get_metric_display()}",
        )

        self.assertEqual(
            str(self.avg_time_helping_queue_statistic),
            f"{self.queue}: {self.avg_time_helping_queue_statistic.get_metric_display()}",
        )
