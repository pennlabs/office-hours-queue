import json

from asgiref.sync import sync_to_async
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async as db
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from django.urls import reverse
from djangorestframework_camel_case.util import camelize
from rest_framework.test import APIClient
from rest_live.testing import async_test, get_headers_for_user

from ohq.models import Announcement, Course, Membership, Question, Queue, Semester
from ohq.serializers import AnnouncementSerializer
from ohq.urls import realtime_router
from channels.testing import WebsocketCommunicator


User = get_user_model()


class QuestionTestCase(TransactionTestCase):
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
            queue=self.queue,
            asked_by=self.student1,
            text="Help me",
        )

        headers = await get_headers_for_user(self.student2)
        self.client = WebsocketCommunicator(AuthMiddlewareStack(realtime_router.as_consumer().as_asgi()), "/ws/subscribe/", headers)
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

        self.assertEqual(question_position, response["instance"]["position"])

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
        self.assertEqual(question_position, response["instance"]["position"])


class AnnouncementTestCase(TransactionTestCase):
    async def asyncSetUp(self):
        self.semester = await db(Semester.objects.create)(year=2020, term=Semester.TERM_SUMMER)
        self.course = await db(Course.objects.create)(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        self.professor = await db(User.objects.create)(username="professor")
        await db(Membership.objects.create)(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.student = await db(User.objects.create)(username="student")
        await db(Membership.objects.create)(
            course=self.course, user=self.student, kind=Membership.KIND_STUDENT
        )

        headers = await get_headers_for_user(self.student)
        self.client = WebsocketCommunicator(AuthMiddlewareStack(realtime_router.as_consumer().as_asgi()), "/ws/subscribe/", headers)
        connected, _ = await self.client.connect()
        self.assertTrue(connected)

    async def asyncTearDown(self):
        await self.client.disconnect()

    @async_test
    async def test_subscribe_list(self):
        payload = {
            "type": "subscribe",
            "id": 1,
            "action": "list",
            "model": "ohq.Announcement",
            "view_kwargs": {"course_pk": self.course.id},
        }
        await self.client.send_json_to(payload)
        self.assertTrue(await self.client.receive_nothing())

        new_announcement = await db(Announcement.objects.create)(
            course=self.course, author=self.professor, content="New announcement"
        )
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Announcement",
            "instance": camelize(AnnouncementSerializer(new_announcement).data),
            "action": "CREATED",
        }
        self.assertEqual(expected, response)

        new_announcement.content = "Updated content"
        await db(new_announcement.save)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Announcement",
            "instance": camelize(AnnouncementSerializer(new_announcement).data),
            "action": "UPDATED",
        }
        self.assertEqual(expected, response)

        annoucement_id = new_announcement.id
        await db(new_announcement.delete)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Announcement",
            "instance": {"pk": annoucement_id, "id": annoucement_id},
            "action": "DELETED",
        }
        self.assertEqual(expected, response)

    @async_test
    async def test_subscribe_single(self):
        new_announcement = await db(Announcement.objects.create)(
            course=self.course, author=self.professor, content="New announcement"
        )

        payload = {
            "type": "subscribe",
            "id": 2,
            "action": "retrieve",
            "model": "ohq.Announcement",
            "view_kwargs": {"course_pk": self.course.id},
            "lookup_by": new_announcement.id,
        }
        await self.client.send_json_to(payload)
        self.assertTrue(await self.client.receive_nothing())

        new_announcement.content = "Updated content"
        await db(new_announcement.save)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 2,
            "model": "ohq.Announcement",
            "instance": camelize(AnnouncementSerializer(new_announcement).data),
            "action": "UPDATED",
        }
        self.assertEqual(expected, response)

        annoucement_id = new_announcement.id
        await db(new_announcement.delete)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 2,
            "model": "ohq.Announcement",
            "instance": {"pk": annoucement_id, "id": annoucement_id},
            "action": "DELETED",
        }
        self.assertEqual(expected, response)
