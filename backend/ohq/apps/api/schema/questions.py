from datetime import datetime

from graphql_relay.node.node import from_global_id

from django.db import transaction

from ohq.apps.api.schema.types import *
from ohq.apps.api.util.errors import *
from ohq.apps.api.util.twilio import send_up_soon_sms


class CreateQuestionInput(graphene.InputObjectType):
    queue_id = graphene.ID(required=True)
    text = graphene.String(required=True)
    tags = graphene.List(graphene.String, required=True)
    video_chat_url = graphene.String(required=False)


class CreateQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class CreateQuestion(graphene.Mutation):
    class Arguments:
        input = CreateQuestionInput(required=True)

    Output = CreateQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        if not input.text:
            raise empty_string_error
        if len(input.text) > 250:
            raise question_too_long_error
        with transaction.atomic():
            user = info.context.user.get_user()
            queue = Queue.objects.get(pk=from_global_id(input.queue_id)[1])
            course = queue.course
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind=CourseUserKind.STUDENT.name,
            ).exists():
                raise user_not_student_error
            if not course.video_chat_enabled and input.video_chat_url is not None:
                raise video_chat_disabled_error
            if (
                course.video_chat_enabled and
                course.require_video_chat_url_on_questions and
                input.video_chat_url is None
            ):
                raise video_chat_url_required_error
            if course.archived:
                raise course_archived_error
            if queue.active_override_time is None:
                raise queue_closed_error
            # Check for any other active questions in this course
            if Question.objects.filter(
                asked_by=user,
                queue__course=course,
                time_started__isnull=True,
                time_rejected__isnull=True,
                time_withdrawn__isnull=True
            ).exists():
                raise too_many_questions_error
            if any(tag not in queue.tags for tag in input.tags):
                raise unrecognized_tag_error

            questions_ahead = Question.objects.filter(
                queue=queue,
                time_started__isnull=True,
                time_rejected__isnull=True,
                time_withdrawn__isnull=True,
            ).count()

            question = Question(
                queue=queue,
                text=input.text,
                tags=input.tags,
                asked_by=user,
                video_chat_url=input.video_chat_url,
                should_send_up_soon_notification=questions_ahead >= 4,
            )
            question.clean_fields()
            question.save()
        return CreateQuestionResponse(question=question)


class UpdateQuestionInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)
    text = graphene.String(required=False)
    tags = graphene.List(graphene.String, required=False)
    # TODO add way to remove video chat url
    video_chat_url = graphene.String(required=False)


class UpdateQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class UpdateQuestion(graphene.Mutation):
    class Arguments:
        input = UpdateQuestionInput(required=True)

    Output = UpdateQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        if not input:
            raise empty_update_error
        if input.text is not None and not input.text:
            raise empty_string_error
        if input.text is not None and len(input.text) > 250:
            raise question_too_long_error
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            queue = question.queue
            course = queue.course
            if question.asked_by != user:
                raise user_not_asker_error
            if course.archived:
                raise course_archived_error
            if question.state is not QuestionState.ACTIVE:
                raise question_not_active_error
            if input.tags is not None and any(tag not in queue.tags for tag in input.tags):
                raise unrecognized_tag_error
            if not course.video_chat_enabled and input.video_chat_url is not None:
                raise video_chat_disabled_error

            if input.text is not None:
                question.text = input.text
            if input.tags is not None:
                question.tags = input.tags
            if input.video_chat_url is not None:
                question.video_chat_url = input.video_chat_url
            question.time_last_updated = datetime.now()
            question.clean_fields()
            question.save()
        return UpdateQuestionResponse(question=question)


# TODO find better place to put this
def notify_up_soon(queue):
    question_to_notify = Question.objects.filter(
        queue=queue,
        time_started__isnull=True,
        time_rejected__isnull=True,
        time_withdrawn__isnull=True,
    ).order_by('order_key')[2:3]  # Gets the 3rd question
    if question_to_notify.exists():
        send_up_soon_sms(question_to_notify.get())


class WithdrawQuestionInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)


class WithdrawQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class WithdrawQuestion(graphene.Mutation):
    class Arguments:
        input = WithdrawQuestionInput(required=True)

    Output = WithdrawQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if question.asked_by != user:
                raise user_not_asker_error
            if question.queue.course.archived:
                raise course_archived_error
            if question.state is not QuestionState.ACTIVE:
                raise question_not_active_error

            question.time_withdrawn = datetime.now()
            question.save()

            notify_up_soon(question.queue)

        return WithdrawQuestionResponse(question=question)


class RejectQuestionInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)
    rejected_reason = graphene.Field(QuestionRejectionReasonType, required=True)
    rejected_reason_other = graphene.String(required=False)


class RejectQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class RejectQuestion(graphene.Mutation):
    class Arguments:
        input = RejectQuestionInput(required=True)

    Output = RejectQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=question.queue.course,
                kind__in=CourseUserKind.staff(),
            ).exists():
                raise user_not_staff_error
            if question.queue.course.archived:
                raise course_archived_error
            if (
                (input.rejected_reason == QuestionRejectionReason.OTHER.name and
                 input.rejected_reason_other is None) or
                (input.rejected_reason != QuestionRejectionReason.OTHER.name and
                 input.rejected_reason_other is not None)
            ):
                raise other_rejection_reason_required_error
            if input.rejected_reason_other is not None and not input.rejected_reason_other:
                raise empty_string_error
            if question.state is not QuestionState.ACTIVE:
                raise question_not_active_error
            question.rejected_reason = input.rejected_reason
            question.rejected_reason_other = input.rejected_reason_other
            question.rejected_by = user
            question.time_rejected = datetime.now()
            question.save()

            notify_up_soon(question.queue)

        return RejectQuestionResponse(question=question)


class StartQuestionInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)


class StartQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class StartQuestion(graphene.Mutation):
    class Arguments:
        input = StartQuestionInput(required=True)

    Output = StartQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=question.queue.course,
                kind__in=CourseUserKind.staff(),
            ).exists():
                raise user_not_staff_error
            if question.queue.course.archived:
                raise course_archived_error
            if question.state is not QuestionState.ACTIVE:
                raise question_not_active_error
            question.time_started = datetime.now()
            question.answered_by = user
            question.save()

        return StartQuestionResponse(question=question)


class UndoStartQuestionInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)


class UndoStartQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class UndoStartQuestion(graphene.Mutation):
    class Arguments:
        input = UndoStartQuestionInput(required=True)

    Output = UndoStartQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if question.answered_by != user:
                raise user_not_answerer_error
            if question.queue.course.archived:
                raise course_archived_error
            if question.state is not QuestionState.STARTED:
                raise question_not_started_error
            question.time_started = None
            question.answered_by = None
            question.save()

        return UndoStartQuestionResponse(question=question)


class FinishQuestionInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)


class FinishQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class FinishQuestion(graphene.Mutation):
    class Arguments:
        input = FinishQuestionInput(required=True)

    Output = FinishQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if question.answered_by != user:
                raise user_not_answerer_error
            if question.queue.course.archived:
                raise course_archived_error
            if question.state is not QuestionState.STARTED:
                raise question_not_started_error
            question.time_answered = datetime.now()
            question.save()

            notify_up_soon(question.queue)

        return FinishQuestionResponse(question=question)
