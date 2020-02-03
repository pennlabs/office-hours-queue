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
                kind=CourseUserKind.STUDENT.name,
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
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=question.queue.course,
                kind__in=CourseUserKind.staff(),
            ).exists():
                raise PermissionError
            if (
                (input.rejected_reason == QuestionRejectionReason.OTHER.name and
                 input.rejected_reason_other is None) or
                (input.rejected_reason != QuestionRejectionReason.OTHER.name and
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
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=question.queue.course,
                kind__in=CourseUserKind.staff(),
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
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            # if not CourseUser.objects.filter(
            #     user=user,
            #     course=question.queue.course,
            #     kind__in=CourseUserKind.staff(),
            # ).exists():
            #     raise PermissionError
            if question.answered_by != user:
                raise PermissionError
            question.time_answered = datetime.now()
            question.save()

        return FinishQuestionResponse(question=question)


class ShortAnswerFeedbackAnswerInput(graphene.InputObjectType):
    feedback_question_id = graphene.ID(required=True)
    answer_text = graphene.String(required=True)


class RadioButtonFeedbackAnswerInput(graphene.InputObjectType):
    feedback_question_id = graphene.ID(required=True)
    answer_choice = graphene.Int(required=True)


class SliderFeedbackAnswerInput(graphene.InputObjectType):
    feedback_question_id = graphene.ID(required=True)
    answer_choice = graphene.Int(required=True)


class AnswerFeedbackQuestionsInput(graphene.InputObjectType):
    question_id = graphene.ID(required=True)
    short_answer_feedback_answers = graphene.List(ShortAnswerFeedbackAnswerInput, required=True)
    radio_button_feedback_answers = graphene.List(RadioButtonFeedbackAnswerInput, required=True)
    slider_feedback_answers = graphene.List(SliderFeedbackAnswerInput, required=True)


class AnswerFeedbackQuestionsResponse(graphene.ObjectType):
    question = graphene.Field(QuestionNode)


class AnswerFeedbackQuestions(graphene.Mutation):
    class Arguments:
        input = AnswerFeedbackQuestionsInput(required=True)

    Output = AnswerFeedbackQuestionsResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            # if not CourseUser.objects.filter(
            #     user=user,
            #     course=question.queue.course,
            #     kind__in=CourseUserKind.student.name,
            # ).exists():
            #     raise PermissionError
            if question.asked_by != user:
                raise PermissionError

            # TODO make these queries more efficient

            required_feedback_question_ids = FeedbackQuestion.objects.filter(
                course=question.queue.course,
                required=True,
            ).values_list('id', flat=True)

            provided_feedback_question_ids = set(
                from_global_id(answer.feedback_question_id)[1] for answer in (
                    input.short_answer_feedback_answers +
                    input.radio_button_feedback_answers +
                    input.slider_feedback_answers
                )
            )

            if (id not in provided_feedback_question_ids for id in required_feedback_question_ids):
                raise ValueError

            feedback_answers = []
            for answer in input.short_answer_feedback_answers:
                feedback_answer = ShortAnswerFeedbackAnswer(
                    feedback_question=ShortAnswerFeedbackQuestion.objects.get(
                        pk=from_global_id(answer.feedback_question_id)[1]
                    ),
                    question=question,
                    answer_text=answer.answer_text,
                )
                feedback_answers.append(feedback_answer)
            for answer in input.radio_button_feedback_answers:
                feedback_answer = RadioButtonFeedbackAnswer(
                    feedback_question=RadioButtonFeedbackQuestion.objects.get(
                        pk=from_global_id(answer.feedback_question_id)[1]
                    ),
                    question=question,
                    answer_choice=answer.answer_choice,
                )
                feedback_answers.append(feedback_answer)
            for answer in input.slider_feedback_answers:
                feedback_answer = SliderFeedbackAnswer(
                    feedback_question=SliderFeedbackQuestion.objects.get(
                        pk=from_global_id(answer.feedback_question_id)[1]
                    ),
                    question=question,
                    answer_choice=answer.answer_choice,
                )
                feedback_answers.append(feedback_answer)

            FeedbackAnswer.objects.bulk_create(feedback_answers)

        return AnswerFeedbackQuestionsResponse(question=question)
