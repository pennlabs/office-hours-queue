from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from parameterized import parameterized
from rest_framework.test import APIClient

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester


User = get_user_model()

users = ["professor", "head_ta", "ta", "student", "non_member", "anonymous"]


def get_test_name(testcase_func, _, param):
    """
    A function to create test names for parameterized
    For example, a test case named test_list will generate names
    of the form test_list_professor, test_list_head_ta, etc.
    """

    return f"{testcase_func.__name__}_{param.args[0]}"


def setUp(self):
    """
    General set up used in each test case.
    """

    self.client = APIClient()
    self.semester = Semester.objects.create(year=2020, term=Semester.TERM_SUMMER)
    self.course = Course.objects.create(
        course_code="000", department="Penn Labs", semester=self.semester
    )

    # Create users
    self.professor = User.objects.create(username="professor")
    self.head_ta = User.objects.create(username="head_ta")
    self.ta = User.objects.create(username="ta")
    self.student = User.objects.create(username="student")
    self.non_member = User.objects.create(username="non_member")
    self.anonymous = None

    # Create Memberships
    Membership.objects.create(
        course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
    )
    Membership.objects.create(course=self.course, user=self.head_ta, kind=Membership.KIND_HEAD_TA)
    Membership.objects.create(course=self.course, user=self.ta, kind=Membership.KIND_TA)
    Membership.objects.create(course=self.course, user=self.student, kind=Membership.KIND_STUDENT)


def test(self, user, action_name, request, url, data=None):
    """
    A helper function to reduce the duplicated code in each test case
    """

    self.client.force_authenticate(user=getattr(self, user))
    response = getattr(self.client, request)(url, data)
    self.client.force_authenticate(user=None)
    self.assertEqual(self.expected[action_name][user], response.status_code)


class CourseTestCase(TestCase):
    def setUp(self):
        setUp(self)

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 200,
                "non_member": 200,
                "anonymous": 403,
            },
            "create": {
                "professor": 201,
                "head_ta": 201,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "retrieve": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 200,
                "non_member": 403,
                "anonymous": 403,
            },
            "destroy": {
                "professor": 403,
                "head_ta": 403,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "modify": {
                "professor": 200,
                "head_ta": 200,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "modify-archived": {
                "professor": 403,
                "head_ta": 403,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(self, user, "list", "get", reverse("ohq:course-list"))

    @parameterized.expand(users, name_func=get_test_name)
    def test_create(self, user):
        test(
            self,
            user,
            "create",
            "post",
            reverse("ohq:course-list"),
            {
                "course_code": "000",
                "department": "TEST",
                "course_title": "Course",
                "semester": self.semester.id,
                "created_role": user.upper(),
            },
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_retrieve(self, user):
        test(self, user, "retrieve", "get", reverse("ohq:course-detail", args=[self.course.id]))

    @parameterized.expand(users, name_func=get_test_name)
    def test_destroy(self, user):
        test(self, user, "destroy", "delete", reverse("ohq:course-detail", args=[self.course.id]))

    @parameterized.expand(users, name_func=get_test_name)
    def test_modify(self, user):
        test(
            self,
            user,
            "modify",
            "patch",
            reverse("ohq:course-detail", args=[self.course.id]),
            {"description": "new"},
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_modify_archived(self, user):
        self.course.archived = True
        self.course.save()
        test(
            self,
            user,
            "modify-archived",
            "patch",
            reverse("ohq:course-detail", args=[self.course.id]),
            {"description": "new"},
        )


class QueueTestCase(TestCase):
    def setUp(self):
        setUp(self)
        self.queue = Queue.objects.create(name="Queue", course=self.course)

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 200,
                "non_member": 403,
                "anonymous": 403,
            },
            "create": {
                "professor": 201,
                "head_ta": 201,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "retrieve": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 200,
                "non_member": 403,
                "anonymous": 403,
            },
            "destroy": {
                "professor": 204,
                "head_ta": 204,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "modify": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(self, user, "list", "get", reverse("ohq:queue-list", args=[self.course.id]))

    @parameterized.expand(users, name_func=get_test_name)
    def test_create(self, user):
        test(
            self,
            user,
            "create",
            "post",
            reverse("ohq:queue-list", args=[self.course.id]),
            {"name": "new", "description": "description"},
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_retrieve(self, user):
        test(
            self,
            user,
            "retrieve",
            "get",
            reverse("ohq:queue-detail", args=[self.course.id, self.queue.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_destroy(self, user):
        test(
            self,
            user,
            "destroy",
            "delete",
            reverse("ohq:queue-detail", args=[self.course.id, self.queue.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_modify(self, user):
        test(
            self,
            user,
            "modify",
            "patch",
            reverse("ohq:queue-detail", args=[self.course.id, self.queue.id]),
            {"active": True},
        )


class QuestionTestCase(TestCase):
    def setUp(self):
        setUp(self)
        self.queue = Queue.objects.create(name="Queue", course=self.course)
        self.question = Question.objects.create(queue=self.queue, asked_by=self.student)

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "create": {
                "professor": 403,
                "head_ta": 403,
                "ta": 403,
                "student": 201,
                "non_member": 403,
                "anonymous": 403,
            },
            "retrieve": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "destroy": {
                "professor": 403,
                "head_ta": 403,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "modify": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(
            self,
            user,
            "list",
            "get",
            reverse("ohq:question-list", args=[self.course.id, self.queue.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_create(self, user):
        test(
            self,
            user,
            "create",
            "post",
            reverse("ohq:question-list", args=[self.course.id, self.queue.id]),
            {"text": "question", "description": "description"},
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_retrieve(self, user):
        test(
            self,
            user,
            "retrieve",
            "get",
            reverse("ohq:question-detail", args=[self.course.id, self.queue.id, self.question.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_destroy(self, user):
        test(
            self,
            user,
            "destroy",
            "delete",
            reverse("ohq:question-detail", args=[self.course.id, self.queue.id, self.question.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_modify(self, user):
        test(
            self,
            user,
            "modify",
            "patch",
            reverse("ohq:question-detail", args=[self.course.id, self.queue.id, self.question.id]),
            {"description": "new"},
        )


class QuestionSearchTestCase(TestCase):
    def setUp(self):
        setUp(self)
        self.queue = Queue.objects.create(name="Queue", course=self.course)
        self.question = Question.objects.create(queue=self.queue, asked_by=self.student)

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(
            self, user, "list", "get", reverse("ohq:questionsearch", args=[self.course.id]),
        )


class MembershipTestCase(TestCase):
    def setUp(self):
        setUp(self)
        self.membership = Membership.objects.get(course=self.course, user=self.ta)

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "create-open": {
                "professor": 403,
                "head_ta": 403,
                "ta": 403,
                "student": 403,
                "non_member": 201,
                "anonymous": 403,
            },
            "create-invite-only": {
                "professor": 403,
                "head_ta": 403,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "retrieve": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "destroy": {
                "professor": 204,
                "head_ta": 204,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "modify": {
                "professor": 200,
                "head_ta": 200,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(self, user, "list", "get", reverse("ohq:member-list", args=[self.course.id]))

    @parameterized.expand(users, name_func=get_test_name)
    def test_create_open(self, user):
        test(
            self,
            user,
            "create-open",
            "post",
            reverse("ohq:member-list", args=[self.course.id]),
            {},
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_create_invite_only(self, user):
        self.course.invite_only = True
        self.course.save()
        test(
            self,
            user,
            "create-invite-only",
            "post",
            reverse("ohq:member-list", args=[self.course.id]),
            {},
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_retrieve(self, user):
        test(
            self,
            user,
            "retrieve",
            "get",
            reverse("ohq:member-detail", args=[self.course.id, self.membership.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_destroy(self, user):
        test(
            self,
            user,
            "destroy",
            "delete",
            reverse("ohq:member-detail", args=[self.course.id, self.membership.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_modify(self, user):
        test(
            self,
            user,
            "modify",
            "patch",
            reverse("ohq:member-detail", args=[self.course.id, self.membership.id]),
            {"description": "new"},
        )


class MembershipInviteTestCase(TestCase):
    def setUp(self):
        setUp(self)
        self.invite = MembershipInvite.objects.create(course=self.course, email="me@example.com")

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "create": {
                "professor": 201,
                "head_ta": 201,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "retrieve": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "destroy": {
                "professor": 204,
                "head_ta": 204,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
            "modify": {
                "professor": 200,
                "head_ta": 200,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(self, user, "list", "get", reverse("ohq:invite-list", args=[self.course.id]))

    @parameterized.expand(users, name_func=get_test_name)
    def test_create(self, user):
        test(
            self,
            user,
            "create",
            "post",
            reverse("ohq:invite-list", args=[self.course.id]),
            {"email": "test@example.com", "kind": Membership.KIND_STUDENT},
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_retrieve(self, user):
        test(
            self,
            user,
            "retrieve",
            "get",
            reverse("ohq:invite-detail", args=[self.course.id, self.invite.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_destroy(self, user):
        test(
            self,
            user,
            "destroy",
            "delete",
            reverse("ohq:invite-detail", args=[self.course.id, self.invite.id]),
        )

    @parameterized.expand(users, name_func=get_test_name)
    def test_modify(self, user):
        test(
            self,
            user,
            "modify",
            "patch",
            reverse("ohq:invite-detail", args=[self.course.id, self.invite.id]),
            {"description": "new"},
        )


class MassInviteTestCase(TestCase):
    def setUp(self):
        setUp(self)

        # Expected results
        self.expected = {
            "create": {
                "professor": 201,
                "head_ta": 201,
                "ta": 403,
                "student": 403,
                "non_member": 403,
                "anonymous": 403,
            }
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_create(self, user):
        test(
            self,
            user,
            "create",
            "post",
            reverse("ohq:mass-invite", args=[self.course.id]),
            {"emails": "test@example.com,test2@example.com", "kind": Membership.KIND_STUDENT},
        )


class LeadershipTestCase(TestCase):
    def setUp(self):
        setUp(self)

        # Expected results
        self.expected = {
            "list": {
                "professor": 200,
                "head_ta": 200,
                "ta": 200,
                "student": 200,
                "non_member": 403,
                "anonymous": 403,
            },
        }

    @parameterized.expand(users, name_func=get_test_name)
    def test_list(self, user):
        test(self, user, "list", "get", reverse("ohq:leadership", args=[self.course.id]))
