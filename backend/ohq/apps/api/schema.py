from datetime import datetime

import graphene
from graphene import relay, ObjectType
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from graphql_relay.node.node import from_global_id

from django.db import transaction
from django.db.models import Q

from ohq.apps.api.models import *


SemesterType = graphene.Enum.from_enum(Semester)
CourseUserKindType = graphene.Enum.from_enum(CourseUserKind)
QuestionRejectionReasonType = graphene.Enum.from_enum(QuestionRejectionReason)


class CourseUserNode(DjangoObjectType):
    class Meta:
        model = CourseUser
        filter_fields = ('kind', 'is_deactivated')
        fields = (
            'is_deactivated',
        )
        interfaces = (relay.Node,)

    kind = graphene.Field(CourseUserKindType, required=True)
    user = graphene.Field(lambda: UserMetaNode, required=True)
    course = graphene.Field(lambda: CourseNode, required=True)


class InvitedCourseUserNode(DjangoObjectType):
    class Meta:
        model = InvitedCourseUser
        filter_fields = ('kind',)
        fields = (
            'email',
            'course',
        )
        interfaces = (relay.Node,)

    kind = graphene.Field(CourseUserKindType, required=True)


class UserNode(DjangoObjectType):
    class Meta:
        model = User
        filter_fields = ('id', 'email')
        fields = (
            'id',
            'full_name',
            'preferred_name',
            'email',
            'phone_number',
        )
        interfaces = (relay.Node,)

    course_users = DjangoFilterConnectionField(CourseUserNode)
    rejected_questions = DjangoFilterConnectionField(lambda: QuestionNode)
    asked_questions = DjangoFilterConnectionField(lambda: QuestionNode)
    answered_questions = DjangoFilterConnectionField(lambda: QuestionNode)

    def resolve_course_users(self, info, **kwargs):
        return CourseUser.objects.filter(user=self, **kwargs)

    def resolve_rejected_questions(self, info, **kwargs):
        return Question.objects.filter(course_user=self, **kwargs)

    def resolve_asked_questions(self, info, **kwargs):
        return Question.objects.filter(course_user=self, **kwargs)

    def resolve_answered_questions(self, info, **kwargs):
        return Question.objects.filter(course_user=self, **kwargs)


class UserMetaNode(DjangoObjectType):
    class Meta:
        model = User
        filter_fields = {
            'id': ['exact'],
            'email': ['exact', 'icontains'],
            'full_name': ['exact', 'icontains'],
        }
        fields = (
            'id',
            'full_name',
            'preferred_name',
            'email',
        )
        interfaces = (relay.Node,)


class QuestionNode(DjangoObjectType):
    class Meta:
        model = Question
        # TODO better filtering class
        filter_fields = ('id', 'time_asked', 'asked_by')
        fields = (
            'id',
            'text',
            'tags',
            'time_asked',
            'time_last_updated',
            'time_answered',
            'time_withdrawn',
            'time_rejected',
            'queue',
        )
        interfaces = (relay.Node,)

    rejected_reason = graphene.Field(QuestionRejectionReasonType, required=True)
    rejected_by = graphene.Field(UserMetaNode)
    asked_by = graphene.Field(UserMetaNode)
    answered_by = graphene.Field(UserMetaNode)


class QueueNode(DjangoObjectType):
    class Meta:
        model = Queue
        filter_fields = (
            'id',
            'name',
        )
        fields = (
            'id',
            'name',
            'description',
            'estimated_wait_time',
            'start_end_times',
            'tags',
        )
        interfaces = (relay.Node,)

    questions = DjangoFilterConnectionField(QuestionNode)

    def resolve_questions(self, info, **kwargs):
        return Question.objects.filter(queue=self, **kwargs)


class CourseNode(DjangoObjectType):
    class Meta:
        model = Course
        filter_fields = (
            'id',
            'name',
            'department',
            'year',
            'semester',
            'archived',
            'invite_only',
        )
        fields = (
            'id',
            'name',
            'department',
            'description',
            'year',
            'archived',
            'invite_only',
        )
        interfaces = (relay.Node,)

    semester = graphene.Field(SemesterType, required=True)
    course_users = DjangoFilterConnectionField(CourseUserNode)
    invited_course_users = DjangoFilterConnectionField(InvitedCourseUserNode)
    queues = DjangoFilterConnectionField(QueueNode)
    feedback_questions = graphene.List(lambda: FeedbackQuestionNode)

    def resolve_course_users(self, info, **kwargs):
        return CourseUser.objects.filter(course=self, **kwargs)

    def resolve_queues(self, info, **kwargs):
        return Queue.objects.filter(course=self, **kwargs)

    def resolve_feedback_questions(self, info, **kwargs):
        return FeedbackQuestion.objects.filter(course=self, **kwargs)


class CourseMetaNode(DjangoObjectType):
    class Meta:
        model = Course
        filter_fields = (
            'name',
            'department',
            'year',
            'semester',
        )
        fields = (
            'id',
            'name',
            'department',
            'description',
            'year',
            'invite_only',
        )
        interfaces = (relay.Node,)

    semester = graphene.Field(SemesterType, required=True)


class ShortAnswerFeedbackQuestionNode(DjangoObjectType):
    class Meta:
        model = ShortAnswerFeedbackQuestion
        fields = (
            'id',
            'question_text',
            'archived',
            'order_key',
        )


class RadioButtonFeedbackQuestionNode(DjangoObjectType):
    class Meta:
        model = RadioButtonFeedbackQuestion
        fields = (
            'id',
            'question_text',
            'archived',
            'order_key',
            'answer_choices',
        )


class SliderFeedbackQuestionNode(DjangoObjectType):
    class Meta:
        model = SliderFeedbackQuestion
        fields = (
            'id',
            'question_text',
            'archived',
            'order_key',
            'answer_lower_bound',
            'answer_upper_bound',
        )


class FeedbackQuestionNode(graphene.Union):
    @classmethod
    def resolve_type(cls, instance, info):
        if isinstance(instance, ShortAnswerFeedbackQuestion):
            return ShortAnswerFeedbackQuestionNode
        elif isinstance(instance, RadioButtonFeedbackQuestion):
            return RadioButtonFeedbackQuestionNode
        elif isinstance(instance, SliderFeedbackQuestion):
            return SliderFeedbackQuestionNode
        return ShortAnswerFeedbackQuestionNode

    class Meta:
        types = (
            ShortAnswerFeedbackQuestionNode,
            RadioButtonFeedbackQuestionNode,
            SliderFeedbackQuestionNode,
        )


class Query(graphene.ObjectType):

    current_user = graphene.Field(UserNode)

    def resolve_current_user(self, info):
        return info.context.user.get_user()

    # User search for invitation
    invitable_users = DjangoFilterConnectionField(UserMetaNode)

    # course_user = graphene.Field(CourseUserNode)
    # course_users = DjangoFilterField(CourseUserNode)

    # courses = graphene.List(CourseNode)
    # courses = DjangoFilterField(CourseNode)

    course = relay.Node.Field(CourseNode)

    # Course search for students joining
    joinable_courses = DjangoFilterConnectionField(CourseMetaNode)

    def resolve_joinable_courses(self, info, **kwargs):
        return Course.objects.filter(invite_only=False, **kwargs)

    queue = relay.Node.Field(QueueNode)



    # def resolve_course_users(self, info, kind, id):
    #     return CourseUser.objects.filter(kind=kind, id=id)


    #
    # def resolve_all_course_users(self, info, **kwargs):
    #     return CourseUser.objects.select_related('course').select_related('user').all()

class CreateUserInput(graphene.InputObjectType):
    full_name = graphene.String(required=True)
    preferred_name = graphene.String(required=True)
    phone_number = graphene.String(required=False)

class CreateUserResponse(graphene.ObjectType):
    user = graphene.Field(UserNode, required=True)

class CreateUser(graphene.Mutation):
    class Arguments:
        input = CreateUserInput(required=True)

    Output = CreateUserResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = User.objects.create(
                full_name=input.full_name,
                preferred_name=input.preferred_name,
                email=info.context.user.email,
                phone_number=input.phone_number,
                auth_user=info.context.user,
            )
            invites = InvitedCourseUser.objects.filter(email=info.context.user.email)
            new_course_users = []
            for invite in invites:
                new_course_users.append(CourseUser(
                    user=user,
                    course = invite.course,
                    kind=invite.kind,
                ))
            CourseUser.objects.bulk_create(new_course_users)
            invites.delete()

        return CreateUserResponse(user=user)


class CreateCourseInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    department = graphene.String(required=True)
    description = graphene.String(required=False)
    year = graphene.Int(required=True)
    semester = graphene.Field(SemesterType, required=True)
    invite_only = graphene.Boolean(required=True)


class CreateCourseResponse(graphene.ObjectType):
    course = graphene.Field(CourseNode, required=False)
    course_user = graphene.Field(CourseUserNode, required=False)


class CreateCourse(graphene.Mutation):
    class Arguments:
        input = CreateCourseInput(required=True)

    Output = CreateCourseResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            course = Course.objects.create(
                name=input.name,
                department=input.department,
                description=input.description or "",
                year=input.year,
                semester=input.semester,
                invite_only=input.invite_only,
            )
            course_user = CourseUser.objects.create(
                user=user,
                course=course,
                kind=CourseUserKind.PROFESSOR.name,
            )

        return CreateCourseResponse(course=course, course_user=course_user)


class CreateQueueInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    description = graphene.String(required=False)
    tags = graphene.List(graphene.String, required=True)
    start_end_times = graphene.String(required=True)
    course_id = graphene.ID(required=True)


class CreateQueueResponse(graphene.ObjectType):
    queue = graphene.Field(QueueNode, required=False)


class CreateQueue(graphene.Mutation):
    class Arguments:
        input = CreateQueueInput(required=True)

    Output = CreateQueueResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA, CourseUserKind.TA],
            ).exists():
                raise PermissionError

            if Queue.objects.filter(course=course, archived=False).count() < Queue.MAX_NUMBER_QUEUES:
                queue = Queue.objects.create(
                    name=input.name,
                    description=input.description or "",
                    tags=input.tags,
                    start_end_times=input.start_end_times,
                    course=course,
                )
            else:
                # TODO raise exception
                queue = None

        return CreateQueueResponse(queue=queue)


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
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA],
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
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA],
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
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA],
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

        return RejectQuestionResponse(question=question)


class AddUserToCourseInput(graphene.InputObjectType):
    user_id = graphene.ID(required=True)
    course_id = graphene.ID(required=True)
    kind = graphene.Field(CourseUserKindType, required=True)


class AddUserToCourseResponse(graphene.ObjectType):
    course_user = graphene.Field(CourseUserNode, required=False)


class AddUserToCourse(graphene.Mutation):
    class Arguments:
        input = AddUserToCourseInput(required=False)

    Output = AddUserToCourseResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user= info.context.user.get_user(),
                course=course,
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA],
            ).exists():
                raise PermissionError

            course_user = CourseUser.objects.create(
                user=User.objects.get(pk=from_global_id(input.user_id)[1]),
                course=course,
                kind=input.kind,
            )

        return AddUserToCourseResponse(course_user=course_user)


class JoinCourseInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)


class JoinCourseResponse(graphene.ObjectType):
    course_user = graphene.Field(CourseUserNode, required=False)


class JoinCourse(graphene.Mutation):
    class Arguments:
        input = JoinCourseInput(required=False)

    Output = JoinCourseResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if course.invite_only:
                # TODO better error
                raise PermissionError

            course_user = CourseUser.objects.create(
                user=info.context.user.get_user(),
                course=course,
                kind=CourseUserKind.STUDENT.name,
            )

        return JoinCourseResponse(course_user=course_user)


class InviteEmailInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    course_id = graphene.ID(required=True)


class InviteEmailResponse(graphene.ObjectType):
    invited_course_user = graphene.Field(InvitedCourseUserNode, required=False)


class InviteEmail(graphene.Mutation):
    class Arguments:
        input = InviteEmailInput(required=False)

    Output = InviteEmailResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user= info.context.user.get_user(),
                course=course,
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA],
            ).exists():
                raise PermissionError

            invited_course_user = InvitedCourseUser.objects.create(
                email=input.email,
                course=course,
                invited_by=None, # TODO
                kind=CourseUserKind.STUDENT.name,
            )

        return InviteEmailResponse(invited_course_user=invited_course_user)


class RemoveUserFromCourseInput(graphene.InputObjectType):
    user_id = graphene.ID(required=True)
    course_id = graphene.ID(required=True)


class RemoveUserFromCourseResponse(graphene.ObjectType):
    success = graphene.Boolean(required=True)


class RemoveUserFromCourse(graphene.Mutation):
    class Arguments:
        input = RemoveUserFromCourseInput(required=False)

    Output = RemoveUserFromCourseResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user= info.context.user.get_user(),
                course=course,
                kind__in=[CourseUserKind.PROFESSOR, CourseUserKind.HEAD_TA],
            ).exists():
                raise PermissionError

            course_user = CourseUser.objects.get(
                user=User.objects.get(pk=from_global_id(input.user_id)[1]),
                course=course,
            )
            course_user.delete()

        return RemoveUserFromCourseResponse(success=True)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    create_course = CreateCourse.Field()
    create_queue = CreateQueue.Field()
    create_short_answer_feedback_question = CreateShortAnswerFeedbackQuestion.Field()
    create_radio_button_feedback_question = CreateRadioButtonFeedbackQuestion.Field()
    create_slider_feedback_question = CreateSliderFeedbackQuestion.Field()

    create_question = CreateQuestion.Field()
    reject_question = RejectQuestion.Field()

    add_user_to_course = AddUserToCourse.Field()
    remove_user_from_course = RemoveUserFromCourse.Field()
    join_course = JoinCourse.Field()
    invite_email = InviteEmail.Field()
