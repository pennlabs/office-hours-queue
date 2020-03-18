from datetime import datetime

from graphql_relay.node.node import from_global_id

from django.db import transaction

from ohq.apps.api.schema.types import *
from ohq.apps.api.util.errors import *
from ohq.apps.api.util import validate_day_of_week, validate_minutes_in_day


class StartEndMinutesInput(graphene.InputObjectType):
    start = graphene.Int(required=True)
    end = graphene.Int(required=True)


class StartEndTimesInput(graphene.InputObjectType):
    day = graphene.Field(DaysOfWeekType, required=True)
    times = graphene.List(StartEndMinutesInput, required=True)


class CreateQueueInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    description = graphene.String(required=False)
    tags = graphene.List(graphene.String, required=True)
    start_end_times = graphene.List(StartEndTimesInput, required=True)
    course_id = graphene.ID(required=True)


class CreateQueueResponse(graphene.ObjectType):
    queue = graphene.Field(QueueNode, required=False)


class CreateQueue(graphene.Mutation):
    class Arguments:
        input = CreateQueueInput(required=True)

    Output = CreateQueueResponse

    @staticmethod
    def startEndTimesInputToJSON(ss):
        json = []
        for s in ss:
            if not validate_day_of_week(s.day):
                raise invalid_day_of_week_error
            if any(not validate_minutes_in_day(time.start) or not validate_minutes_in_day(time.end)
                   for time in s.times):
                raise invalid_time_of_day_error
            json.append({
                "day": s.day,
                "times": [{"start": time.start, "end": time.end} for time in s.times]
            })
        return json

    @staticmethod
    def mutate(root, info, input):
        if not input.name:
            raise empty_string_error
        with transaction.atomic():
            user = info.context.user.get_user()
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise user_not_leadership_error
            if course.archived:
                raise course_archived_error
            if (
                Queue.objects.filter(course=course, archived=False).count() >=
                Queue.MAX_NUMBER_QUEUES
            ):
                raise too_many_queues_error
            seen_tags = set()
            tags = [x for x in input.tags if not (x in seen_tags or seen_tags.add(x))]
            queue = Queue.objects.create(
                name=input.name,
                description=input.description or "",
                tags=tags,
                start_end_times=CreateQueue.startEndTimesInputToJSON(input.start_end_times),
                course=course,
            )
        return CreateQueueResponse(queue=queue)


class UpdateQueueInput(graphene.InputObjectType):
    queue_id = graphene.ID(required=True)
    name = graphene.String(required=False)
    description = graphene.String(required=False)
    tags = graphene.List(graphene.String, required=False)
    start_end_times = graphene.List(StartEndTimesInput, required=False)
    archived = graphene.Boolean(required=False)


class UpdateQueueResponse(graphene.ObjectType):
    queue = graphene.Field(QueueNode, required=False)


class UpdateQueue(graphene.Mutation):
    class Arguments:
        input = UpdateQueueInput(required=True)

    Output = UpdateQueueResponse

    @staticmethod
    def mutate(root, info, input):
        if not input:
            raise empty_update_error
        if input.name is not None and not input.name:
            raise empty_string_error
        with transaction.atomic():
            user = info.context.user.get_user()
            queue = Queue.objects.get(pk=from_global_id(input.queue_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=queue.course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise user_not_leadership_error
            if queue.course.archived:
                raise course_archived_error
            if input.name is not None:
                queue.name = input.name
            if input.description is not None:
                queue.description = input.description
            if input.tags is not None:
                seen = set()
                queue.tags = [x for x in input.tags if not (x in seen or seen.add(x))]
            if input.start_end_times is not None:
                queue.start_end_times = CreateQueue.startEndTimesInputToJSON(input.start_end_times),
            if input.archived is not None:
                queue.archived = input.archived
            queue.save()
        return UpdateQueueResponse(queue=queue)


class ManuallyActivateQueueInput(graphene.InputObjectType):
    queue_id = graphene.ID(required=True)


class ManuallyActivateQueueResponse(graphene.ObjectType):
    queue = graphene.Field(QueueNode, required=False)


class ManuallyActivateQueue(graphene.Mutation):
    class Arguments:
        input = ManuallyActivateQueueInput(required=True)

    Output = ManuallyActivateQueueResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            queue = Queue.objects.get(pk=from_global_id(input.queue_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=queue.course,
                kind__in=CourseUserKind.staff(),
            ).exists():
                raise user_not_staff_error
            if queue.course.archived:
                raise course_archived_error
            if queue.active_override_time is not None:
                raise queue_active_error
            queue.active_override_time = datetime.now()
            queue.save()

        return ManuallyActivateQueueResponse(queue=queue)


class ManuallyDeactivateQueueInput(graphene.InputObjectType):
    queue_id = graphene.ID(required=True)


class ManuallyDeactivateQueueResponse(graphene.ObjectType):
    queue = graphene.Field(QueueNode, required=False)


class ManuallyDeactivateQueue(graphene.Mutation):
    class Arguments:
        input = ManuallyDeactivateQueueInput(required=True)

    Output = ManuallyDeactivateQueueResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            queue = Queue.objects.get(pk=from_global_id(input.queue_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=queue.course,
                kind__in=CourseUserKind.staff(),
            ).exists():
                raise user_not_staff_error
            if queue.course.archived:
                raise course_archived_error
            if queue.active_override_time is None:
                raise queue_inactive_error
            queue.active_override_time = None
            queue.save()

        return ManuallyDeactivateQueueResponse(queue=queue)
