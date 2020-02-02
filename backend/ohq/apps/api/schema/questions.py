from datetime import datetime

from graphql_relay.node.node import from_global_id

from django.db import transaction

from ohq.apps.api.schema.types import *


class CreateQuestionInput(graphene.InputObjectType):
    queue_id = graphene.ID(required=True)
    text = graphene.String(required=True)
    tags = graphene.List(graphene.String, required=True)


class CreateQuestionResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class CreateQuestion(graphene.Mutation):
    class Arguments:
        input = CreateQuestionInput(required=True)

    Output = CreateQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            queue = Queue.objects.get(pk=from_global_id(input.queue_id)[1])
            course = queue.course
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind=CourseUserKind.STUDENT,
            ).exists():
                raise PermissionError
            if any(tag not in course.tags for tag in input.tags):
                raise ValueError
            question = Question.objects.create(
                queue=queue,
                text=input.text,
                tags=input.tags,
                asked_by=user,
            )

        return CreateQuestionResponse(question=question)


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
            question = Question.objects.get(pk=from_global_id(input.queue_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=question.queue.course,
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA, CourseUserKind.TA],
            ).exists():
                raise PermissionError
            if (
                (input.rejected_reason == QuestionRejectionReason.OTHER and
                 input.rejected_reason_other is None) or
                (input.rejected_reason != QuestionRejectionReason.OTHER and
                 input.rejected_reason_other is not None)
            ):
                raise ValueError
            question.rejected_reason = input.rejected_reason
            question.rejected_reason_other = input.rejected_reason_other
            question.rejected_by = user
            question.time_rejected = datetime.now()
            question.save()

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
            question = Question.objects.get(pk=from_global_id(input.queue_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=question.queue.course,
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA, CourseUserKind.TA],
            ).exists():
                raise PermissionError
            question.time_started = datetime.now()
            question.answered_by = user
            question.save()

        return StartQuestionResponse(question=question)


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
            question = Question.objects.get(pk=from_global_id(input.queue_id)[1])
            # if not CourseUser.objects.filter(
            #     user=user,
            #     course=question.queue.course,
            #     kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA, CourseUserKind.TA],
            # ).exists():
            #     raise PermissionError
            if question.answered_by != user:
                raise PermissionError
            question.time_answered = datetime.now()
            question.save()

        return FinishQuestionResponse(question=question)


# class AnswerFeedbackQuestionsInput(graphene.InputObjectType):
#     question_id = graphene.ID(required=True)
#
#
# class AnswerFeedbackQuestionsResponse(graphene.ObjectType):
#     question = graphene.Field(QuestionNode)
#
#
# class AnswerFeedbackQuestions(graphene.Mutation):
#     class Arguments:
#         input = AnswerFeedbackQuestionsInput(required=True)
#
#     Output = AnswerFeedbackQuestionsResponse
#
#     @staticmethod
#     def mutate(root, info, input):
#         with transaction.atomic():
#             user = info.context.user.get_user()
#             question = Question.objects.get(pk=from_global_id(input.queue_id)[1])
#             # if not CourseUser.objects.filter(
#             #     user=user,
#             #     course=question.queue.course,
#             #     kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA, CourseUserKind.TA],
#             # ).exists():
#             #     raise PermissionError
#             if question.asked_by != user:
#                 raise PermissionError
#
#             question.save()
#
#         return AnswerFeedbackQuestionsResponse(question=question)
