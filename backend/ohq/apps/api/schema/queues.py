from graphql_relay.node.node import from_global_id

from django.db import transaction

from ohq.apps.api.schema.types import *
from ohq.apps.api.util import validateDayOfWeek, validateMinutesInDay


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
            if not validateDayOfWeek(s.day):
                raise ValueError
            if any(not validateMinutesInDay(time.start) or not validateMinutesInDay(time.end)
                   for time in s.times):
                raise ValueError
            json.append({
                "day": s.day,
                "times": [{"start": time.start, "end": time.end} for time in s.times]
            })
        return json

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise PermissionError

            if Queue.objects.filter(course=course, archived=False).count() < Queue.MAX_NUMBER_QUEUES:
                queue = Queue.objects.create(
                    name=input.name,
                    description=input.description or "",
                    tags=input.tags,
                    start_end_times=CreateQueue.startEndTimesInputToJSON(input.start_end_times),
                    course=course,
                )
            else:
                # TODO raise exception
                queue = None

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
            raise ValueError
        with transaction.atomic():
            user = info.context.user.get_user()
            queue = Queue.objects.get(pk=from_global_id(input.queue_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=queue.course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise PermissionError

            if input.name is not None:
                queue.name = input.name
            if input.description is not None:
                queue.description = input.description
            if input.tags is not None:
                queue.tags = input.tags
            if input.start_end_times is not None:
                queue.start_end_times = CreateQueue.startEndTimesInputToJSON(input.start_end_times),
            if input.archived is not None:
                queue.archived = input.archived
            queue.save()
        return UpdateQueueResponse(queue=queue)

