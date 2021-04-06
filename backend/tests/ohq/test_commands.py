from io import StringIO
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from django.utils import timezone

from ohq.models import (
    Course,
    CourseStatistic,
    Membership,
    MembershipInvite,
    Question,
    Queue,
    QueueStatistic,
    Semester,
)


User = get_user_model()


@patch("ohq.management.commands.calculatewaittimes.calculate_wait_times")
class CalculateWaitTimesTestCase(TestCase):
    def test_call_command(self, mock_calculate):
        out = StringIO()
        call_command("calculatewaittimes", stdout=out)
        mock_calculate.assert_called()
        self.assertEqual("Updated estimated queue wait times!\n", out.getvalue())


class RegisterClassTestCase(TestCase):
    def setUp(self):
        self.course = ("CIS", "160", "Math", "FALL", "2020")

        Semester.objects.create(year="2020", term="FALL")
        User.objects.create_user("prof1", "prof1@a.com", "prof1")
        User.objects.create_user("head1", "head1@a.com", "head1")

    def test_input_email_role_length_mismatch(self):
        with self.assertRaises(CommandError):
            call_command(
                "createcourse",
                *self.course,
                emails=["a@b.com", "a@c.com"],
                roles=[Membership.KIND_PROFESSOR],
            )

    def test_register_class(self):
        out = StringIO()
        call_command(
            "createcourse",
            *self.course,
            emails=["prof1@a.com", "head1@a.com", "prof2@a.com", "head2@a.com"],
            roles=[
                Membership.KIND_PROFESSOR,
                Membership.KIND_HEAD_TA,
                Membership.KIND_PROFESSOR,
                Membership.KIND_HEAD_TA,
            ],
            stdout=out,
        )
        course = Course.objects.get(department="CIS", course_code="160")
        self.assertEqual(course.course_title, "Math")
        self.assertEqual(course.semester.year, 2020)
        self.assertEqual(course.semester.term, "FALL")

        prof1 = Membership.objects.get(
            course__course_code="160", course__department="CIS", user__email="prof1@a.com"
        )
        prof2 = MembershipInvite.objects.get(
            course__course_code="160", course__department="CIS", email="prof2@a.com"
        )
        head1 = Membership.objects.get(
            course__course_code="160", course__department="CIS", user__email="head1@a.com"
        )
        head2 = MembershipInvite.objects.get(
            course__course_code="160", course__department="CIS", email="head2@a.com"
        )

        self.assertEqual(Membership.KIND_PROFESSOR, prof1.kind)
        self.assertEqual(Membership.KIND_PROFESSOR, prof2.kind)
        self.assertEqual(Membership.KIND_HEAD_TA, head1.kind)
        self.assertEqual(Membership.KIND_HEAD_TA, head2.kind)

        course_msg = "Created new course 'CIS 160: Fall 2020'"
        prof_msg = "Added 1 professor(s) and invited 1 professor(s)"
        ta_msg = "Added 1 Head TA(s) and invited 1 Head TA(s)"

        stdout_msg = course_msg + "\n" + prof_msg + "\n" + ta_msg + "\n"

        self.assertEqual(stdout_msg, out.getvalue())


class AverageQueueWaitTimeTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student = User.objects.create_user("student", "student@a.com", "student")

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        self.wait_times = [100, 200, 300, 400]
        for i in range(len(self.wait_times)):
            # test all varieties of statuses
            q1 = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday + timezone.timedelta(seconds=self.wait_times[i]),
                status=Question.STATUS_ACTIVE,
            )
            q1.time_asked = yesterday
            q1.save()

            q2 = Question.objects.create(
                text=f"Question {i + len(self.wait_times)}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday
                + timezone.timedelta(seconds=self.wait_times[i] * 2),
                time_responded_to=yesterday + timezone.timedelta(seconds=1000),
                status=Question.STATUS_ANSWERED,
            )
            q2.time_asked = yesterday
            q2.save()

            q3 = Question.objects.create(
                text=f"Question {i + 2 * len(self.wait_times)}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday
                + timezone.timedelta(seconds=self.wait_times[i] * 3),
                time_responded_to=yesterday,
                status=Question.STATUS_REJECTED,
            )
            q3.time_asked = yesterday
            q3.save()

        # create question that isn't in the current week
        self.old_wait_time = 120
        q4 = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday
            - timezone.timedelta(weeks=2)
            + timezone.timedelta(seconds=self.old_wait_time),
            status=Question.STATUS_ACTIVE,
        )
        q4.time_asked = yesterday - timezone.timedelta(weeks=2)
        q4.save()

    def test_avg_queue_wait_computation(self):
        call_command("queue_weekly_stat")
        expected = sum(self.wait_times) * 6 / (len(self.wait_times) * 3)

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        actual = QueueStatistic.objects.get(
            queue=self.queue, metric=QueueStatistic.METRIC_AVG_WAIT, date=last_sunday
        ).value

        self.assertEqual(expected, actual)

        call_command("queue_weekly_stat", "--hist")
        expected_old = self.old_wait_time

        old_sunday = last_sunday - timezone.timedelta(weeks=2)
        actual_old = QueueStatistic.objects.get(
            queue=self.queue, metric=QueueStatistic.METRIC_AVG_WAIT, date=old_sunday
        ).value

        self.assertEqual(expected_old, actual_old)


class AverageQueueTimeHelpingTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student = User.objects.create_user("student", "student@a.com", "student")

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        self.help_times = [100, 200, 300, 400]
        for i in range(len(self.help_times)):
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday,
                time_responded_to=yesterday + timezone.timedelta(seconds=self.help_times[i]),
                status=Question.STATUS_ANSWERED,
            )
            question.time_asked = yesterday
            question.save()

        # create question that isn't in the current week
        self.old_question_time_helped = 1234
        old_question = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday - timezone.timedelta(weeks=2),
            time_responded_to=yesterday
            - timezone.timedelta(weeks=2)
            + timezone.timedelta(seconds=self.old_question_time_helped),
            status=Question.STATUS_ANSWERED,
        )
        old_question.time_asked = yesterday - timezone.timedelta(weeks=2)
        old_question.save()

        # create a rejected question, won't be included
        rejected = Question.objects.create(
            text="Withdrawn question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday,
            time_responded_to=yesterday,
            status=Question.STATUS_REJECTED,
        )
        rejected.time_asked = yesterday
        rejected.save()

    def test_avg_time_helping_computation(self):
        call_command("queue_weekly_stat")
        expected = sum(self.help_times) / len(self.help_times)

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        actual = QueueStatistic.objects.get(
            queue=self.queue, metric=QueueStatistic.METRIC_AVG_TIME_HELPING, date=last_sunday
        ).value

        self.assertEqual(expected, actual)

        call_command("queue_weekly_stat", "--hist")
        expected_old = self.old_question_time_helped
        actual_old = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_AVG_TIME_HELPING,
            date=last_sunday - timezone.timedelta(weeks=2),
        ).value

        self.assertEqual(expected_old, actual_old)


class AverageQueueWaitHeatmapTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student = User.objects.create_user("student", "student@a.com", "student")

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        self.wait_times_9 = [100, 200, 300, 400]
        for i in range(len(self.wait_times_9)):
            yesterday_9 = yesterday.replace(hour=9, minute=0)
            time_asked = (
                yesterday_9
                if i % 2 == 0
                else yesterday_9 + timezone.timedelta(weeks=-1, minutes=30)
            )
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=time_asked + timezone.timedelta(seconds=self.wait_times_9[i]),
                status=Question.STATUS_ACTIVE,
            )
            question.time_asked = time_asked
            question.save()

        self.wait_times_17 = [500, 600, 700, 800]
        for i in range(len(self.wait_times_17)):
            yesterday_17 = yesterday.replace(hour=17, minute=0)
            time_asked = (
                yesterday_17
                if i % 2 == 0
                else yesterday_17 + timezone.timedelta(weeks=-1, minutes=30)
            )
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=time_asked
                + timezone.timedelta(seconds=self.wait_times_17[i]),
                status=Question.STATUS_ACTIVE,
            )
            question.time_asked = time_asked
            question.save()

        # create question that is two days old - not included
        self.older_wait_time = 321
        self.older = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday_9
            - timezone.timedelta(weeks=2, days=2, seconds=-self.older_wait_time),
            status=Question.STATUS_ACTIVE,
        )
        self.older.time_asked = yesterday_9 - timezone.timedelta(weeks=2, days=2)
        self.older.save()

    def test_avg_queue_wait_computation(self):
        call_command("queue_heatmap_stat")
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        yesterday_weekday = yesterday.weekday()

        expected_9 = sum(self.wait_times_9) / len(self.wait_times_9)
        actual_9 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_WAIT,
            day=(yesterday_weekday + 1) % 7 + 1,
            hour=9,
        ).value
        self.assertEqual(expected_9, actual_9)

        expected_17 = sum(self.wait_times_17) / len(self.wait_times_17)
        actual_17 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_WAIT,
            day=(yesterday_weekday + 1) % 7 + 1,
            hour=17,
        ).value
        self.assertEqual(expected_17, actual_17)

        expected_8 = 0
        actual_8 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_WAIT,
            day=(yesterday_weekday + 1) % 7 + 1,
            hour=8,
        ).value
        self.assertEqual(expected_8, actual_8)

        call_command("queue_heatmap_stat", "--hist")

        expected_older = self.older_wait_time
        actual_older = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_WAIT,
            day=(self.older.time_asked.weekday() + 1) % 7 + 1,
            hour=self.older.time_asked.hour,
        ).value
        self.assertEqual(expected_older, actual_older)


class NumberQuestionsAnsweredQueueTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student = User.objects.create_user("student", "student@a.com", "student")

        yesterday = timezone.localtime() - timezone.timedelta(days=1)
        self.num_questions_answered = 4

        for i in range(self.num_questions_answered):
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday - timezone.timedelta(seconds=10),
                time_responded_to=yesterday,
                status=Question.STATUS_ANSWERED,
            )
            question.time_asked = yesterday - timezone.timedelta(seconds=20)
            question.save()

        # create question that isn't in the current week
        old_question = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday - timezone.timedelta(weeks=2),
            time_responded_to=yesterday - timezone.timedelta(weeks=1),
            status=Question.STATUS_ANSWERED,
        )
        old_question.time_asked = yesterday - timezone.timedelta(weeks=2)
        old_question.save()

        # create an active question, won't be included
        active = Question.objects.create(
            text="active question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday,
            time_responded_to=yesterday,
            status=Question.STATUS_ACTIVE,
        )
        active.time_asked = yesterday
        active.save()

    def test_num_questions_ans_computation(self):
        call_command("queue_weekly_stat")
        expected = self.num_questions_answered

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        actual = QueueStatistic.objects.get(
            queue=self.queue, metric=QueueStatistic.METRIC_NUM_ANSWERED, date=last_sunday
        ).value

        self.assertEqual(expected, actual)

        call_command("queue_weekly_stat", "--hist")

        expected_old = 1
        actual_old = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_NUM_ANSWERED,
            date=last_sunday - timezone.timedelta(weeks=1),
        ).value

        self.assertEqual(expected_old, actual_old)


class NumberStudentsHelpedQueueTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student1 = User.objects.create_user("student1", "student1@a.com", "student1")
        student2 = User.objects.create_user("student2", "student2@a.com", "student2")
        student3 = User.objects.create_user("student3", "student3@a.com", "student3")

        yesterday = timezone.localtime() - timezone.timedelta(days=1)
        students = [student1, student2, student3]
        self.number_helped = 2

        for i in range(self.number_helped):
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=students[i],
                responded_to_by=ta,
                time_response_started=yesterday - timezone.timedelta(seconds=10),
                time_responded_to=yesterday,
                status=Question.STATUS_ANSWERED,
            )
            question.time_asked = yesterday - timezone.timedelta(seconds=20)
            question.save()

        # create question that isn't in the current week
        old_question = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student3,
            responded_to_by=ta,
            time_response_started=yesterday - timezone.timedelta(weeks=2),
            time_responded_to=yesterday - timezone.timedelta(weeks=1),
            status=Question.STATUS_ANSWERED,
        )
        old_question.time_asked = yesterday - timezone.timedelta(weeks=2)
        old_question.save()

        # create an active question, won't be included
        active = Question.objects.create(
            text="active question",
            queue=self.queue,
            asked_by=student3,
            responded_to_by=ta,
            time_response_started=yesterday,
            time_responded_to=yesterday,
            status=Question.STATUS_ACTIVE,
        )
        active.time_asked = yesterday
        active.save()

    def test_num_students_helped_computation(self):
        call_command("queue_weekly_stat")
        expected = self.number_helped

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        last_sunday = yesterday - timezone.timedelta(days=(yesterday.weekday() + 1) % 7)
        actual = QueueStatistic.objects.get(
            queue=self.queue, metric=QueueStatistic.METRIC_STUDENTS_HELPED, date=last_sunday
        ).value

        self.assertEqual(expected, actual)

        call_command("queue_weekly_stat", "--hist")
        expected = 1
        actual = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_STUDENTS_HELPED,
            date=last_sunday - timezone.timedelta(weeks=1),
        ).value


class QuestionsPerTAQueueHeatmapTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta1 = User.objects.create_user("ta1", "ta1@a.com", "ta1")
        ta2 = User.objects.create_user("ta2", "ta2@a.com", "ta2")
        student = User.objects.create_user("student", "student@a.com", "student")

        self.num_tas_8 = 2
        self.num_tas_17 = 2

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        self.ta_1_questions_8_week_1 = 2
        self.ta_1_questions_8_week_2 = 3
        for i in range(self.ta_1_questions_8_week_1 + self.ta_1_questions_8_week_2):
            yesterday_8 = yesterday.replace(hour=8, minute=0)
            time_asked = (
                yesterday_8
                if i >= self.ta_1_questions_8_week_1
                else yesterday_8 + timezone.timedelta(weeks=-1, minutes=30)
            )
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta1 if i % 2 == 0 else ta2,
                time_response_started=time_asked + timezone.timedelta(minutes=10),
                status=Question.STATUS_ACTIVE if i % 3 == 0 else Question.STATUS_ANSWERED,
            )
            question.time_asked = time_asked
            question.save()

        self.ta_1_questions_17 = 3
        self.ta_2_questions_17 = 4
        for i in range(self.ta_1_questions_17 + self.ta_2_questions_17):
            yesterday_17 = yesterday.replace(hour=17, minute=0)
            time_asked = yesterday_17
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta1 if i < self.ta_1_questions_17 else ta2,
                time_response_started=time_asked + timezone.timedelta(minutes=10),
                status=Question.STATUS_ACTIVE if i % 3 == 0 else Question.STATUS_ANSWERED,
            )
            question.time_asked = time_asked
            question.save()

        # divide by zero case setup
        self.questions_20 = 2
        for i in range(self.questions_20):
            yesterday_20 = yesterday.replace(hour=20, minute=0)
            time_asked = yesterday_20
            question = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                status=Question.STATUS_ASKED,
            )
            question.time_asked = time_asked
            question.save()

        # create question that is two days old - not included
        self.older_time_asked = yesterday_8 - timezone.timedelta(weeks=2, days=2)
        self.older_time_asked.replace(hour=8, minute=0)
        older = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta2,
            time_response_started=self.older_time_asked + timezone.timedelta(minutes=5),
            status=Question.STATUS_ACTIVE,
        )
        older.time_asked = self.older_time_asked
        older.save()

    def test_questions_per_ta_computation(self):
        call_command("queue_heatmap_stat")
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        yesterday_weekday = yesterday.weekday()

        expected_8 = (
            self.ta_1_questions_8_week_1 / self.num_tas_8
            + self.ta_1_questions_8_week_2 / self.num_tas_8
        ) / 2
        actual_8 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
            day=(yesterday_weekday + 1) % 7 + 1,
            hour=8,
        ).value
        self.assertEqual(expected_8, actual_8)

        expected_17 = (self.ta_1_questions_17 + self.ta_2_questions_17) / self.num_tas_17
        actual_17 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
            day=(yesterday_weekday + 1) % 7 + 1,
            hour=17,
        ).value
        self.assertEqual(expected_17, actual_17)

        expected_20 = self.questions_20
        actual_20 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
            day=(yesterday_weekday + 1) % 7 + 1,
            hour=20,
        ).value
        self.assertEqual(expected_20, actual_20)

        call_command("queue_heatmap_stat", "--hist")

        expected_two_days_ago_8 = 1
        actual_two_days_ago_8 = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_HEATMAP_QUESTIONS_PER_TA,
            day=(self.older_time_asked.weekday() + 1) % 7 + 1,
            hour=self.older_time_asked.hour,
        ).value
        self.assertEqual(expected_two_days_ago_8, actual_two_days_ago_8)


class AverageQueueWaitTimeByDateTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student = User.objects.create_user("student", "student@a.com", "student")

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        # this command computes avg wait time yesterday
        self.wait_times = [100, 200, 300, 400]
        for i in range(len(self.wait_times)):
            # test all varieties of statuses
            q1 = Question.objects.create(
                text=f"Question {i}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday + timezone.timedelta(seconds=self.wait_times[i]),
                status=Question.STATUS_ACTIVE,
            )
            q1.time_asked = yesterday
            q1.save()

            q2 = Question.objects.create(
                text=f"Question {i + len(self.wait_times)}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday
                + timezone.timedelta(seconds=self.wait_times[i] * 2),
                time_responded_to=yesterday + timezone.timedelta(seconds=1000),
                status=Question.STATUS_ANSWERED,
            )
            q2.time_asked = yesterday
            q2.save()

            q3 = Question.objects.create(
                text=f"Question {i + 2 * len(self.wait_times)}",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta,
                time_response_started=yesterday
                + timezone.timedelta(seconds=self.wait_times[i] * 3),
                time_responded_to=yesterday + timezone.timedelta(seconds=self.wait_times[i] * 3),
                status=Question.STATUS_REJECTED,
            )
            q3.time_asked = yesterday
            q3.save()

        # create question that wasn't yesterday
        self.old_time_wait = 789
        q4 = Question.objects.create(
            text="Old question",
            queue=self.queue,
            asked_by=student,
            responded_to_by=ta,
            time_response_started=yesterday
            - timezone.timedelta(days=2, seconds=-self.old_time_wait),
            status=Question.STATUS_ACTIVE,
        )
        q4.time_asked = yesterday - timezone.timedelta(days=2)
        q4.save()

    def test_wait_time_days_computation(self):
        call_command("wait_time_days")
        expected = sum(self.wait_times) * 6 / (len(self.wait_times) * 3)

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        actual = QueueStatistic.objects.get(
            queue=self.queue, metric=QueueStatistic.METRIC_LIST_WAIT_TIME_DAYS, date=yesterday
        ).value

        self.assertEqual(expected, actual)

        call_command("wait_time_days", "--hist")
        expected_old = self.old_time_wait
        actual_old = QueueStatistic.objects.get(
            queue=self.queue,
            metric=QueueStatistic.METRIC_LIST_WAIT_TIME_DAYS,
            date=yesterday - timezone.timedelta(days=2),
        ).value

        self.assertEqual(expected_old, actual_old)


class StudentMostQuestionsAskedTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student1 = User.objects.create_user("student1", "student1@a.com", "student1")
        student2 = User.objects.create_user("student2", "student2@a.com", "student2")
        student3 = User.objects.create_user("student3", "student3@a.com", "student3")
        student4 = User.objects.create_user("student4", "student4@a.com", "student4")
        student5 = User.objects.create_user("student5", "student5@a.com", "student5")
        student6 = User.objects.create_user("student6", "student6@a.com", "student6")
        student7 = User.objects.create_user("student7", "student7@a.com", "student7")
        students = [student1, student2, student3, student4, student5, student6, student7]

        self.num_questions_per_student = {
            student1: 30,
            student2: 20,
            student3: 10,
            student4: 5,
            student5: 4,
            student6: 2,
            student7: 50,
        }

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        # this command computes avg wait time yesterday
        for student in students:
            for i in range(self.num_questions_per_student[student]):
                # test all varieties of statuses
                q1 = Question.objects.create(
                    text=f"Question {i} Active",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    status=Question.STATUS_ACTIVE,
                )
                q1.time_asked = yesterday
                q1.save()

                q2 = Question.objects.create(
                    text=f"Question {i} Answered",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday + timezone.timedelta(seconds=100),
                    status=Question.STATUS_ANSWERED,
                )
                q2.time_asked = yesterday
                q2.save()

                q3 = Question.objects.create(
                    text=f"Question {i} Rejected",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday,
                    status=Question.STATUS_REJECTED,
                )
                q3.time_asked = yesterday
                q3.save()

        # create questions that weren't in the last week
        for i in range(10):
            q4 = Question.objects.create(
                text="Old question",
                queue=self.queue,
                asked_by=student1,
                responded_to_by=ta,
                time_response_started=yesterday - timezone.timedelta(days=9),
                time_responded_to=yesterday
                - timezone.timedelta(days=9)
                + timezone.timedelta(seconds=100),
                status=Question.STATUS_ANSWERED,
            )
            q4.time_asked = yesterday - timezone.timedelta(days=9, minutes=20)
            q4.save()

    def test_student_most_questions_computation(self):
        call_command("course_stat")

        # Top 5 students who asked to most questions
        expected = {
            student.pk: count
            for student, count in sorted(
                self.num_questions_per_student.items(), key=lambda x: -x[1]
            )[:5]
        }

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        query = CourseStatistic.objects.filter(
            metric=CourseStatistic.METRIC_STUDENT_QUESTIONS_ASKED, date=yesterday
        )
        actual = {}
        for ele in query:
            actual[ele.user.pk] = int(ele.value)
        self.assertEqual(expected, actual)


class StudentMostTimeBeingHelpedTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        ta = User.objects.create_user("ta", "ta@a.com", "ta")
        student1 = User.objects.create_user("student1", "student1@a.com", "student1")
        student2 = User.objects.create_user("student2", "student2@a.com", "student2")
        student3 = User.objects.create_user("student3", "student3@a.com", "student3")
        student4 = User.objects.create_user("student4", "student4@a.com", "student4")
        student5 = User.objects.create_user("student5", "student5@a.com", "student5")
        student6 = User.objects.create_user("student6", "student6@a.com", "student6")
        student7 = User.objects.create_user("student7", "student7@a.com", "student7")
        students = [student1, student2, student3, student4, student5, student6, student7]

        self.num_questions_per_student = {
            student1: 1,
            student2: 2,
            student3: 3,
            student4: 4,
            student5: 5,
            student6: 6,
            student7: 7,
        }
        self.time_per_question_student = {
            student1: 500,
            student2: 200,
            student3: 300,
            student4: 800,
            student5: 900,
            student6: 300,
            student7: 100,
        }

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        # this command computes avg wait time yesterday
        for student in students:
            for i in range(self.num_questions_per_student[student]):
                # test all varieties of statuses
                q1 = Question.objects.create(
                    text=f"Question {i} Active",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    status=Question.STATUS_ACTIVE,
                )
                q1.time_asked = yesterday
                q1.save()

                q2 = Question.objects.create(
                    text=f"Question {i} Answered",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday
                    + timezone.timedelta(seconds=self.time_per_question_student[student]),
                    status=Question.STATUS_ANSWERED,
                )
                q2.time_asked = yesterday
                q2.save()

                q3 = Question.objects.create(
                    text=f"Question {i} Rejected",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday,
                    status=Question.STATUS_REJECTED,
                )
                q3.time_asked = yesterday
                q3.save()

        # create questions that weren't in the last week
        for i in range(10):
            q4 = Question.objects.create(
                text="Old question",
                queue=self.queue,
                asked_by=student1,
                responded_to_by=ta,
                time_response_started=yesterday - timezone.timedelta(days=9),
                time_responded_to=yesterday
                - timezone.timedelta(days=9)
                + timezone.timedelta(seconds=100),
                status=Question.STATUS_ANSWERED,
            )
            q4.time_asked = yesterday - timezone.timedelta(days=9, minutes=20)
            q4.save()

    def test_student_most_time_being_helped_computation(self):
        call_command("course_stat")
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)

        # Top 5 students who spent the most time getting help
        total_time = {}
        for student, question_count in self.num_questions_per_student.items():
            total_time[student] = question_count * self.time_per_question_student[student]

        expected = {
            student.pk: count
            for student, count in sorted(total_time.items(), key=lambda x: -x[1])[:5]
        }

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        query = CourseStatistic.objects.filter(
            metric=CourseStatistic.METRIC_STUDENT_TIME_BEING_HELPED, date=yesterday
        )
        actual = {}
        for ele in query:
            actual[ele.user.pk] = int(ele.value)
        self.assertEqual(expected, actual)


class InstructorMostQuestionsAnsweredTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        student = User.objects.create_user("student", "student@a.com", "student")
        ta1 = User.objects.create_user("ta1", "ta1@a.com", "ta1")
        ta2 = User.objects.create_user("ta2", "ta2@a.com", "ta2")
        ta3 = User.objects.create_user("ta3", "ta3@a.com", "ta3")
        ta4 = User.objects.create_user("ta4", "ta4@a.com", "ta4")
        ta5 = User.objects.create_user("ta5", "ta5@a.com", "ta5")
        ta6 = User.objects.create_user("ta6", "ta6@a.com", "ta6")
        ta7 = User.objects.create_user("ta7", "ta7@a.com", "ta7")
        tas = [ta1, ta2, ta3, ta4, ta5, ta6, ta7]

        self.num_questions_per_ta = {ta1: 21, ta2: 19, ta3: 15, ta4: 12, ta5: 11, ta6: 8, ta7: 50}

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        # this command computes avg wait time yesterday
        for ta in tas:
            for i in range(self.num_questions_per_ta[ta]):
                # test all varieties of statuses
                q1 = Question.objects.create(
                    text=f"Question {i} Active",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    status=Question.STATUS_ACTIVE,
                )
                q1.time_asked = yesterday
                q1.save()

                q2 = Question.objects.create(
                    text=f"Question {i} Answered",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday + timezone.timedelta(seconds=100),
                    status=Question.STATUS_ANSWERED,
                )
                q2.time_asked = yesterday
                q2.save()

                q3 = Question.objects.create(
                    text=f"Question {i} Rejected",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday,
                    status=Question.STATUS_REJECTED,
                )
                q3.time_asked = yesterday
                q3.save()

        # create questions that weren't in the last week
        for i in range(10):
            q4 = Question.objects.create(
                text="Old question",
                queue=self.queue,
                asked_by=student,
                responded_to_by=ta1,
                time_response_started=yesterday - timezone.timedelta(days=9),
                time_responded_to=yesterday
                - timezone.timedelta(days=9)
                + timezone.timedelta(seconds=100),
                status=Question.STATUS_ANSWERED,
            )
            q4.time_asked = yesterday - timezone.timedelta(days=9, minutes=20)
            q4.save()

    def test_ta_most_questions_answered_computation(self):
        call_command("course_stat")

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)

        # Top 5 TAs who answered the most questions
        expected = {
            ta.pk: count
            for ta, count in sorted(self.num_questions_per_ta.items(), key=lambda x: -x[1])[:5]
        }

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        query = CourseStatistic.objects.filter(
            metric=CourseStatistic.METRIC_INSTR_QUESTIONS_ANSWERED, date=yesterday
        )
        actual = {}
        for ele in query:
            actual[ele.user.pk] = int(ele.value)
        self.assertEqual(expected, actual)


class InstructorMostTimeHelpingTestCase(TestCase):
    def setUp(self):
        semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
        course = Course.objects.create(
            course_code="000", department="TEST", course_title="Title", semester=semester
        )
        self.queue = Queue.objects.create(name="Queue", course=course)
        student = User.objects.create_user("student", "student@a.com", "student")
        ta1 = User.objects.create_user("ta1", "ta1@a.com", "ta1")
        ta2 = User.objects.create_user("ta2", "ta2@a.com", "ta2")
        ta3 = User.objects.create_user("ta3", "ta3@a.com", "ta3")
        ta4 = User.objects.create_user("ta4", "ta4@a.com", "ta4")
        ta5 = User.objects.create_user("ta5", "ta5@a.com", "ta5")
        ta6 = User.objects.create_user("ta6", "ta6@a.com", "ta6")
        ta7 = User.objects.create_user("ta7", "ta7@a.com", "ta7")
        tas = [ta1, ta2, ta3, ta4, ta5, ta6, ta7]

        self.num_questions_per_ta = {ta1: 12, ta2: 8, ta3: 14, ta4: 6, ta5: 31, ta6: 2, ta7: 9}
        self.time_per_question_ta = {
            ta1: 1000,
            ta2: 2000,
            ta3: 1200,
            ta4: 800,
            ta5: 600,
            ta6: 500,
            ta7: 400,
        }

        yesterday = timezone.localtime() - timezone.timedelta(days=1)

        # this command computes avg wait time yesterday
        for ta in tas:
            for i in range(self.num_questions_per_ta[ta]):
                # test all varieties of statuses
                q1 = Question.objects.create(
                    text=f"Question {i} Active",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    status=Question.STATUS_ACTIVE,
                )
                q1.time_asked = yesterday
                q1.save()

                q2 = Question.objects.create(
                    text=f"Question {i} Answered",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday
                    + timezone.timedelta(seconds=self.time_per_question_ta[ta]),
                    status=Question.STATUS_ANSWERED,
                )
                q2.time_asked = yesterday
                q2.save()

                q3 = Question.objects.create(
                    text=f"Question {i} Rejected",
                    queue=self.queue,
                    asked_by=student,
                    responded_to_by=ta,
                    time_response_started=yesterday,
                    time_responded_to=yesterday,
                    status=Question.STATUS_REJECTED,
                )
                q3.time_asked = yesterday
                q3.save()

    def test_instructor_most_time_helping_computation(self):
        call_command("course_stat")
        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)

        # Top 5 students who spent the most time getting help
        total_time = {}
        for ta, question_count in self.num_questions_per_ta.items():
            total_time[ta] = question_count * self.time_per_question_ta[ta]

        expected = {
            ta.pk: count for ta, count in sorted(total_time.items(), key=lambda x: -x[1])[:5]
        }

        yesterday = timezone.datetime.today().date() - timezone.timedelta(days=1)
        query = CourseStatistic.objects.filter(
            metric=CourseStatistic.METRIC_INSTR_TIME_ANSWERING, date=yesterday
        )
        actual = {}
        for ele in query:
            actual[ele.user.pk] = int(ele.value)
        self.assertEqual(expected, actual)


class ArchiveCourseTestCase(TestCase):
    def setUp(self):
        sems = [
            (2020, Semester.TERM_FALL),
            (2021, Semester.TERM_SPRING),
            (2022, Semester.TERM_SPRING),
        ]

        for year, term in sems:
            sem = Semester.objects.create(year=year, term=term)
            Course.objects.create(
                course_code="ABC", department="DEPT", course_title="Tests", semester=sem
            )

            if year == 2020:
                Course.objects.create(
                    course_code="DEF", department="DEPT", course_title="Tests", semester=sem
                )

    def test_archive_course(self):
        out = StringIO()
        self.assertEqual(len(Course.objects.filter(archived=False)), 4)
        call_command("archive", Semester.TERM_FALL, 2020, stdout=out)
        self.assertEqual(len(Course.objects.filter(archived=False)), 2)
        call_command("archive", Semester.TERM_SPRING, 2021, stdout=out)
        self.assertEqual(len(Course.objects.filter(archived=False)), 1)
        lastCourse = Course.objects.filter(archived=False).first()
        self.assertEqual(lastCourse.semester.year, 2022)
        self.assertEqual(lastCourse.semester.term, Semester.TERM_SPRING)
