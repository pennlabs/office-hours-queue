import graphene
from graphene import relay
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

import django_filters

from ohq.apps.api.models import *


SemesterType = graphene.Enum.from_enum(Semester)
CourseUserKindType = graphene.Enum.from_enum(CourseUserKind)
QuestionRejectionReasonType = graphene.Enum.from_enum(QuestionRejectionReason)
QuestionStateType = graphene.Enum.from_enum(QuestionState)


class DaysOfWeekType(graphene.Enum):
    M = "M"
    T = "T"
    W = "W"
    R = "R"
    F = "F"
    S = "S"
    N = "N"


class CourseUserNode(DjangoObjectType):
    class Meta:
        model = CourseUser
        filter_fields = ('kind', 'deactivated')
        fields = (
            'deactivated',
            'time_created',
        )
        interfaces = (relay.Node,)

    kind = graphene.Field(CourseUserKindType, required=True)
    user = graphene.Field(lambda: UserMetaNode, required=True)
    course = graphene.Field(lambda: CourseNode, required=True)
    invited_by = graphene.Field(lambda: UserMetaNode, required=False)


class InvitedCourseUserNode(DjangoObjectType):
    class Meta:
        model = InvitedCourseUser
        filter_fields = ('kind',)
        fields = (
            'email',
            'course',
            'time_created',
        )
        interfaces = (relay.Node,)

    kind = graphene.Field(CourseUserKindType, required=True)
    invited_by = graphene.Field(lambda: UserMetaNode, required=False)


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
            'time_joined',
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


# class UserMetaFilter(django_filters.FilterSet):
#     @property
#     def qs(self):
#         # The query context can be found in self.request.
#         return super(UserMetaFilter, self).qs.filter(owner=self.request.user)


class QuestionNode(DjangoObjectType):
    class Meta:
        model = Question
        # TODO better filtering class
        filter_fields = ('id',)
        fields = (
            'id',
            'text',
            'tags',
            'time_asked',
            'time_withdrawn',
            'time_started',
            'time_answered',
            'time_rejected',
            'rejected_reason_other',
            'state',
            'queue',
            'order_key',
        )
        interfaces = (relay.Node,)

    state = graphene.Field(QuestionStateType)
    rejected_reason = graphene.Field(QuestionRejectionReasonType)
    rejected_by = graphene.Field(UserMetaNode)
    asked_by = graphene.Field(UserMetaNode)
    answered_by = graphene.Field(UserMetaNode)
    feedback_answers = graphene.List(lambda: FeedbackAnswerNode)

    questions_ahead = graphene.Int()

    def resolve_feedback_answers(self, info, **kwargs):
        return FeedbackAnswer.objects.filter(question=self, **kwargs)

    def resolve_questions_ahead(self, info, **kwargs):
        return Question.objects.filter(
            queue=self.queue,
            order_key__lt=self.order_key,
            time_started__isnull=True,
        ).count()


class StartEndMinutes(graphene.ObjectType):
    start = graphene.Int(required=True)
    end = graphene.Int(required=True)


class StartEndTimes(graphene.ObjectType):
    day = graphene.Field(DaysOfWeekType, required=True)
    times = graphene.List(StartEndMinutes, required=True)


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
            'tags',
            'archived',
        )
        interfaces = (relay.Node,)

    questions = DjangoFilterConnectionField(QuestionNode)
    start_end_times = graphene.List(StartEndTimes, required=True)

    def resolve_questions(self, info, **kwargs):
        return Question.objects.filter(queue=self, **kwargs)

    def resolve_start_end_times(self, info, **kwargs):
        # TODO change days of the week to an enum
        return [
            StartEndTimes(day=s["day"], times=[
                StartEndMinutes(start=time["start"], end=time["end"])
                for time in s["times"]
            ])
            for s in self.start_end_times
        ]


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
    professors = graphene.List(UserMetaNode, required=True)

    def resolve_professors(self, info, **kwargs):
        return CourseUser.objects.filter(course=self, kind=CourseUserKind.PROFESSOR.name, **kwargs)


class ShortAnswerFeedbackQuestionNode(DjangoObjectType):
    class Meta:
        model = ShortAnswerFeedbackQuestion
        fields = (
            'id',
            'question_text',
            'order_key',
            'archived',
            'required',
        )
        interfaces = (relay.Node,)


class RadioButtonFeedbackQuestionNode(DjangoObjectType):
    class Meta:
        model = RadioButtonFeedbackQuestion
        fields = (
            'id',
            'question_text',
            'order_key',
            'archived',
            'required',
            'answer_choices',
        )
        interfaces = (relay.Node,)


class SliderFeedbackQuestionNode(DjangoObjectType):
    class Meta:
        model = SliderFeedbackQuestion
        fields = (
            'id',
            'question_text',
            'order_key',
            'archived',
            'required',
            'answer_lower_bound',
            'answer_upper_bound',
        )
        interfaces = (relay.Node,)


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


class ShortAnswerFeedbackAnswerNode(DjangoObjectType):
    class Meta:
        model = ShortAnswerFeedbackAnswer
        fields = (
            'id',
            'time_created',
            'answer_text',
        )
        interfaces = (relay.Node,)

    question = graphene.Field(lambda: QuestionNode, required=True)
    feedback_question = graphene.Field(ShortAnswerFeedbackQuestionNode, required=True)


class RadioButtonFeedbackAnswerNode(DjangoObjectType):
    class Meta:
        model = RadioButtonFeedbackAnswer
        fields = (
            'id',
            'time_created',
            'answer_choice',
        )
        interfaces = (relay.Node,)

    question = graphene.Field(lambda: QuestionNode, required=True)
    feedback_question = graphene.Field(RadioButtonFeedbackQuestionNode, required=True)


class SliderFeedbackAnswerNode(DjangoObjectType):
    class Meta:
        model = SliderFeedbackAnswer
        fields = (
            'id',
            'time_created',
            'answer_choice',
        )
        interfaces = (relay.Node,)

    question = graphene.Field(lambda: QuestionNode, required=True)
    feedback_question = graphene.Field(SliderFeedbackQuestionNode, required=True)


class FeedbackAnswerNode(graphene.Union):
    @classmethod
    def resolve_type(cls, instance, info):
        if isinstance(instance, ShortAnswerFeedbackAnswer):
            return ShortAnswerFeedbackAnswerNode
        elif isinstance(instance, RadioButtonFeedbackAnswer):
            return RadioButtonFeedbackAnswerNode
        elif isinstance(instance, SliderFeedbackAnswer):
            return SliderFeedbackAnswerNode
        return ShortAnswerFeedbackAnswerNode

    class Meta:
        types = (
            ShortAnswerFeedbackAnswerNode,
            RadioButtonFeedbackAnswerNode,
            SliderFeedbackAnswerNode,
        )
