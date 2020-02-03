from graphql_relay.node.node import from_global_id

from django.db import transaction

from ohq.apps.api.schema.types import *


class CreateShortAnswerFeedbackQuestionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    question_text = graphene.String(required=True)
    order_key = graphene.Int(required=False)


class CreateShortAnswerFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(ShortAnswerFeedbackQuestionNode)


class CreateShortAnswerFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = CreateShortAnswerFeedbackQuestionInput(required=True)

    Output = CreateShortAnswerFeedbackQuestionResponse

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
            feedback_question = ShortAnswerFeedbackQuestion.objects.create(
                course=course,
                question_text=input.question_text,
                order_key=input.order_key or FeedbackQuestion.objects.filter(course=course).count()
            )

        return CreateShortAnswerFeedbackQuestionResponse(feedback_question=feedback_question)


class CreateRadioButtonFeedbackQuestionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    question_text = graphene.String(required=True)
    answer_choices = graphene.List(graphene.String, required=True)
    order_key = graphene.Int(required=False)


class CreateRadioButtonFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(RadioButtonFeedbackQuestionNode)


class CreateRadioButtonFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = CreateRadioButtonFeedbackQuestionInput(required=True)

    Output = CreateRadioButtonFeedbackQuestionResponse

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
            feedback_question = RadioButtonFeedbackQuestion.objects.create(
                course=course,
                question_text=input.question_text,
                answer_choices=input.answer_choices,
                order_key=input.order_key or FeedbackQuestion.objects.filter(course=course).count()
            )

        return CreateRadioButtonFeedbackQuestionResponse(feedback_question=feedback_question)


class CreateSliderFeedbackQuestionInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    question_text = graphene.String(required=True)
    answer_lower_bound = graphene.Int(required=True)
    answer_upper_bound = graphene.Int(required=True)
    order_key = graphene.Int(required=False)


class CreateSliderFeedbackQuestionResponse(graphene.ObjectType):
    feedback_question = graphene.Field(SliderFeedbackQuestionNode)


class CreateSliderFeedbackQuestion(graphene.Mutation):
    class Arguments:
        input = CreateSliderFeedbackQuestionInput(required=True)

    Output = CreateSliderFeedbackQuestionResponse

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
            feedback_question = SliderFeedbackQuestion.objects.create(
                course=course,
                question_text=input.question_text,
                answer_lower_bound=input.answer_lower_bound,
                answer_upper_bound=input.answer_upper_bound,
                order_key=input.order_key or FeedbackQuestion.objects.filter(course=course).count()
            )

        return CreateSliderFeedbackQuestionResponse(feedback_question=feedback_question)
