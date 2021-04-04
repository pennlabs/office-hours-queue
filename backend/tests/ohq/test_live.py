from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.test import TransactionTestCase
from django.utils import timezone
from djangorestframework_camel_case.util import camelize
from rest_live.testing import APICommunicator, async_test, get_headers_for_user

from ohq.models import Course, Membership, Queue, Semester
from ohq.serializers import MembershipSerializer
from ohq.urls import realtime_router


User = get_user_model()


class ActiveStaffTest(TransactionTestCase):
    async def asyncSetUp(self):
        self.semester = await database_sync_to_async(Semester.objects.create)(
            year=2020, term=Semester.TERM_SUMMER
        )
        self.course = await database_sync_to_async(Course.objects.create)(
            course_code="000", department="TEST", course_title="Title", semester=self.semester
        )
        self.queue = await database_sync_to_async(Queue.objects.create)(
            name="Queue", course=self.course
        )
        self.professor = await database_sync_to_async(User.objects.create)(username="professor")
        self.professor_membership = await database_sync_to_async(Membership.objects.create)(
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
            "model": "ohq.Membership",
            "view_kwargs": {"course_pk": self.course.id},
            "query_params": {"active": "true"},
        }
        await self.client.send_json_to(payload)
        self.assertTrue(await self.client.receive_nothing())

        self.professor_membership.last_active = timezone.now()
        await database_sync_to_async(self.professor_membership.save)()

        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Membership",
            "instance": camelize(MembershipSerializer(self.professor_membership).data),
            "action": "CREATED",
        }
        self.assertEqual(expected, response)

        self.professor_membership.last_active = timezone.now() - timezone.timedelta(minutes=2)
        await database_sync_to_async(self.professor_membership.save)()

        response = await self.client.receive_json_from()
        expected = {
            "type": "broadcast",
            "id": 1,
            "model": "ohq.Membership",
            "instance": {"pk": self.professor_membership.pk, "id": self.professor_membership.id},
            "action": "DELETED",
        }
        self.assertEqual(expected, response)
