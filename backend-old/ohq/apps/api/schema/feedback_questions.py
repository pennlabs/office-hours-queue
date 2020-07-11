from graphql_relay.node.node import from_global_id

from django.db import transaction
from django.db.models import F

from ohq.apps.api.schema.types import *
from ohq.apps.api.util.errors import *


class CreateShortAnswerFeedbackQuestionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    question_text = graphene.String(required=True)
    order_key = graphene.Int(required=False)
    required = graphene.Boolean(required=True)


class CreateShortAnswerFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(ShortAnswerFeedbackQuestionNode)


class CreateShortAnswerFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = CreateShortAnswerFeedbackQuestionInput(required=True)

    Output = CreateShortAnswerFeedbackQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        if not input.question_text:
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
            feedback_question = ShortAnswerFeedbackQuestion.objects.create(
                course=course,
                question_text=input.question_text,
                order_key=input.order_key or FeedbackQuestion.objects.filter(course=course).count(),
                required=input.required,
            )

        return CreateShortAnswerFeedbackQuestionResponse(feedback_question=feedback_question)


class CreateRadioButtonFeedbackQuestionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    question_text = graphene.String(required=True)
    answer_choices = graphene.List(graphene.String, required=True)
    order_key = graphene.Int(required=False)
    required = graphene.Boolean(required=True)


class CreateRadioButtonFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(RadioButtonFeedbackQuestionNode)


class CreateRadioButtonFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = CreateRadioButtonFeedbackQuestionInput(required=True)

    Output = CreateRadioButtonFeedbackQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        if (
            not input.question_text or
            any(not answer_choice for answer_choice in input.answer_choices)
        ):
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
            feedback_question = RadioButtonFeedbackQuestion.objects.create(
                course=course,
                question_text=input.question_text,
                answer_choices=input.answer_choices,
                order_key=input.order_key or FeedbackQuestion.objects.filter(course=course).count(),
                required=input.required
            )

        return CreateRadioButtonFeedbackQuestionResponse(feedback_question=feedback_question)


class CreateSliderFeedbackQuestionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    question_text = graphene.String(required=True)
    answer_lower_bound = graphene.Int(required=True)
    answer_upper_bound = graphene.Int(required=True)
    order_key = graphene.Int(required=False)
    required = graphene.Boolean(required=True)


class CreateSliderFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(SliderFeedbackQuestionNode)


class CreateSliderFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = CreateSliderFeedbackQuestionInput(required=True)

    Output = CreateSliderFeedbackQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        if not input.question_text:
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
            feedback_question = SliderFeedbackQuestion.objects.create(
                course=course,
                question_text=input.question_text,
                answer_lower_bound=input.answer_lower_bound,
                answer_upper_bound=input.answer_upper_bound,
                order_key=input.order_key or FeedbackQuestion.objects.filter(course=course).count(),
                required=input.required,
            )

        return CreateSliderFeedbackQuestionResponse(feedback_question=feedback_question)


class UpdateFeedbackQuestionInput(graphene.InputObjectType):
    feedback_question_id = graphene.ID(required=True)
    archived = graphene.Boolean(required=False)
    required = graphene.Boolean(required=False)
    order_key = graphene.Int(required=False)


class UpdateFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(ShortAnswerFeedbackQuestionNode)


class UpdateFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = UpdateFeedbackQuestionInput(required=True)

    Output = UpdateFeedbackQuestionResponse

    @staticmethod
    def mutate(root, info, input):
        if not input:
            raise empty_update_error
        with transaction.atomic():
            user = info.context.user.get_user()
            feedback_question = FeedbackQuestion.objects.get(
                pk=from_global_id(input.feedback_question)[1]
            )
            course = feedback_question.course
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise user_not_leadership_error
            if course.archived:
                raise course_archived_error

            if input.archived:
                feedback_question.archived = input.archived
            if input.required:
                feedback_question.required = input.required
            if input.order_key and feedback_question.order_key != input.order_key:
                old_order_key = feedback_question.order_key
                feedback_question.order_key = input.order_key
                if input.order_key < old_order_key:
                    # Moved up, so increment others
                    FeedbackQuestion.objects.filter(
                        course=course,
                        order_key__gte=input.order_key,
                        order_key__lt=old_order_key,
                    ).update(order_key=F('order_key') + 1)
                else:
                    # Moved down, so decrement others
                    FeedbackQuestion.objects.filter(
                        course=course,
                        order_key__gt=input.order_key,
                        order_key__lte=old_order_key,
                    ).update(order_key=F('order_key') - 1)

        return UpdateFeedbackQuestionResponse(feedback_question=feedback_question)


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
        if any(not answer.answer_text for answer in input.short_answer_feedback_answers):
            raise empty_string_error
        with transaction.atomic():
            user = info.context.user.get_user()
            question = Question.objects.get(pk=from_global_id(input.question_id)[1])
            if question.asked_by != user:
                raise user_not_asker_error
            if question.state is not QuestionState.ANSWERED:
                raise question_not_answered_error

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
                raise all_required_feedback_questions_not_answered_error

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
