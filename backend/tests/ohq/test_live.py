from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from djangorestframework_camel_case.util import camelize
from rest_live.testing import APICommunicator, async_test, get_headers_for_user

from ohq.models import Announcement, Course, Membership, Semester
from ohq.serializers import AnnouncementSerializer
from ohq.urls import realtime_router


User = get_user_model()


class AnnouncementTest(TransactionTestCase):
    async def asyncSetUp(self):
        self.semester = await database_sync_to_async(Semester.objects.create)(
            year=2020, term=Semester.TERM_SUMMER
        )
        self.course = await database_sync_to_async(Course.objects.create)(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        self.professor = await database_sync_to_async(User.objects.create)(username="professor")
        await database_sync_to_async(Membership.objects.create)(
            course=self.course, user=self.professor, kind=Membership.KIND_PROFESSOR
        )
        self.student = await database_sync_to_async(User.objects.create)(username="student")
        await database_sync_to_async(Membership.objects.create)(
            course=self.course, user=self.student, kind=Membership.KIND_STUDENT
        )

        headers = await get_headers_for_user(self.student)
        self.client = APICommunicator(
            AuthMiddlewareStack(realtime_router.as_consumer()), "/api/ws/subscribe/", headers
        )
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

        new_announcement = await database_sync_to_async(Announcement.objects.create)(
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
        await database_sync_to_async(new_announcement.save)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Announcement",
            "instance": camelize(AnnouncementSerializer(new_announcement).data),
            "action": "UPDATED",
        }
        self.assertEqual(expected, response)

    @async_test
    async def test_subscribe_single(self):
        new_announcement = await database_sync_to_async(Announcement.objects.create)(
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
        await database_sync_to_async(new_announcement.save)()
        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 2,
            "model": "ohq.Announcement",
            "instance": camelize(AnnouncementSerializer(new_announcement).data),
            "action": "UPDATED",
        }
        self.assertEqual(expected, response)
