import json

from asgiref.sync import sync_to_async
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async as db
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_live.testing import APICommunicator, async_test, get_headers_for_user

from ohq.models import Course, Membership, Question, Queue, Semester
from ohq.urls import realtime_router


User = get_user_model()


class QuestionTest(TransactionTestCase):
    async def asyncSetUp(self):
        self.semester = await db(Semester.objects.create)(year=2020, term=Semester.TERM_SUMMER)
        self.course = await db(Course.objects.create)(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        self.queue = await db(Queue.objects.create)(name="Queue", course=self.course)
        self.professor = await db(User.objects.create)(username="professor")
        self.professor_membership = await db(Membership.objects.create)(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.student1 = await db(User.objects.create)(username="student1")
        await db(Membership.objects.create)(
            course=self.course, user=self.student1, kind=Membership.KIND_STUDENT
        )
        self.student2 = await db(User.objects.create)(username="student2")
        await db(Membership.objects.create)(
            course=self.course, user=self.student2, kind=Membership.KIND_STUDENT
        )
        self.old_question = await db(Question.objects.create)(
            queue=self.queue, asked_by=self.student1, text="Help me",
        )

        headers = await get_headers_for_user(self.student2)
        self.client = APICommunicator(
            AuthMiddlewareStack(realtime_router.as_consumer()), "/api/ws/subscribe/", headers
        )
        connected, _ = await self.client.connect()
        self.assertTrue(connected)

        self.api_client = APIClient()

    async def asyncTearDown(self):
        await self.client.disconnect()

    @async_test
    async def testPositionUpdate(self):
        list_payload = {
            "type": "subscribe",
            "id": 1,
            "action": "list",
            "model": "ohq.Question",
            "view_kwargs": {"course_pk": self.course.id, "queue_pk": self.queue.id},
        }

        await self.client.send_json_to(list_payload)
        self.assertTrue(await self.client.receive_nothing())

        await sync_to_async(self.api_client.force_authenticate)(user=self.student2)
        new_question = await sync_to_async(self.api_client.post)(
            reverse("ohq:question-list", args=[self.course.id, self.queue.id]),
            {"text": "New question", "tags": []},
        )

        question_position = 2
        response = await self.client.receive_json_from()

        self.assertEquals(question_position, response["instance"]["position"])

        retrieve_payload = {
            "type": "subscribe",
            "id": 1,
            "action": "retrieve",
            "model": "ohq.Question",
            "lookup_by": json.loads(new_question.content)["id"],
            "view_kwargs": {"course_pk": self.course.id, "queue_pk": self.queue.id},
        }

        await self.client.send_json_to(retrieve_payload)
        self.assertTrue(await self.client.receive_nothing())

        await sync_to_async(self.api_client.force_authenticate)(user=self.professor)
        await sync_to_async(self.api_client.patch)(
            reverse(
                "ohq:question-detail", args=[self.course.id, self.queue.id, self.old_question.id]
            ),
            {"status": Question.STATUS_ACTIVE},
        )
        question_position -= 1

        response = await self.client.receive_json_from()
        self.assertEquals(question_position, response["instance"]["position"])


class QueueTestCase(TransactionTestCase):
    async def asyncSetUp(self):
        self.semester = await db(Semester.objects.create)(year=2020, term=Semester.TERM_SUMMER)
        self.course = await db(Course.objects.create)(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        self.course2 = await db(Course.objects.create)(
            course_code="001", department="TEST 2", course_title="Title 2", semester=self.semester
        )
        self.queue = await db(Queue.objects.create)(name="Queue", course=self.course)
        self.professor = await db(User.objects.create)(username="professor")
        self.professor_membership = await db(Membership.objects.create)(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.student1 = await db(User.objects.create)(username="student1")
        await db(Membership.objects.create)(
            course=self.course, user=self.student1, kind=Membership.KIND_STUDENT
        )
        self.student2 = await db(User.objects.create)(username="student2")
        await db(Membership.objects.create)(
            course=self.course, user=self.student2, kind=Membership.KIND_STUDENT
        )
        self.old_question = await db(Question.objects.create)(
            queue=self.queue, asked_by=self.student1, text="Help me",
        )

        headers = await get_headers_for_user(self.student2)
        self.client = APICommunicator(
            AuthMiddlewareStack(realtime_router.as_consumer()), "/api/ws/subscribe/", headers
        )
        connected, _ = await self.client.connect()
        self.assertTrue(connected)

        self.api_client = APIClient()

    async def asyncTearDown(self):
        await self.client.disconnect()

    @async_test
    async def test_subscribe_list(self):
        payload = {
            "type": "subscribe",
            "id": 1,
            "action": "list",
            "model": "ohq.Queue",
            "view_kwargs": {"course_pk": self.course.id},
        }
        await self.client.send_json_to(payload)
        self.assertTrue(await self.client.receive_nothing())

        # creating a new queue sends message
        queue2 = await db(Queue.objects.create)(
            name="Queue 2", course=self.course, description="This is a new queue"
        )
        response = await self.client.receive_json_from()

        self.assertEqual(queue2.name, response["instance"]["name"])
        self.assertEqual(queue2.description, response["instance"]["description"])

        # deleting a queue sends message
        id = queue2.id
        await db(queue2.delete)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Queue",
            "action": "DELETED",
            "instance": {"pk": id, "id": id},
        }
        self.assertEqual(expected, response)

    @async_test
    async def test_subscribe_single(self):
        queue3 = await db(Queue.objects.create)(
            name="Queue 3", course=self.course, description="This is a new queue 3"
        )
        payload = {
            "type": "subscribe",
            "id": 2,
            "action": "retrieve",
            "model": "ohq.Queue",
            "view_kwargs": {"course_pk": self.course.id},
            "lookup_by": queue3.id,
        }
        await self.client.send_json_to(payload)
        self.assertTrue(await self.client.receive_nothing())

        # changing subscribed queue sends message
        queue3.description = "New description"
        await db(queue3.save)()
        response = await self.client.receive_json_from()
        self.assertEqual(queue3.description, response["instance"]["description"])

        # deleting a queue sends message
        id = queue3.id
        await db(queue3.delete)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 2,
            "model": "ohq.Queue",
            "action": "DELETED",
            "instance": {"pk": id, "id": id},
        }
        self.assertEqual(expected, response)

        # changing non-subscribed queue doesn't send message
        queue4 = await db(Queue.objects.create)(
            name="Queue 4", course=self.course2, description="This queue is not subscribed"
        )
        queue4.description = "New description"
        await db(queue4.save)()
        self.assertTrue(await self.client.receive_nothing())
