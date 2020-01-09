import graphene
from graphene import relay, ObjectType
from graphene_django.types import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField

from graphql_relay.node.node import from_global_id


from ohq.apps.api.util.django_filter import DjangoFilterField

from ohq.apps.api.models import *


SemesterType = graphene.Enum.from_enum(Semester)
CourseUserKindType = graphene.Enum.from_enum(CourseUserKind)
QuestionRejectionReasonType = graphene.Enum.from_enum(QuestionRejectionReason)


class CourseUserNode(DjangoObjectType):
    class Meta:
        model = CourseUser
        filter_fields = ('kind', 'is_deactivated')
        fields = (
            'user',
            'course',
            'is_deactivated',
        )
        interfaces = (relay.Node,)

    rejected_questions = DjangoFilterConnectionField(lambda: CourseUserNode)
    asked_questions = DjangoFilterConnectionField(lambda: CourseUserNode)
    answered_questions = DjangoFilterConnectionField(lambda: CourseUserNode)
    kind = graphene.Field(CourseUserKindType, required=True)

    def resolve_rejected_questions(self, info, **kwargs):
        return Question.objects.filter(course_user=self, **kwargs)

    def resolve_asked_questions(self, info, **kwargs):
        return Question.objects.filter(course_user=self, **kwargs)

    def resolve_answered_questions(self, info, **kwargs):
        return Question.objects.filter(course_user=self, **kwargs)


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

    def resolve_course_users(self, info, **kwargs):
        print("\n\nkwargs", kwargs, "\n\n")
        return CourseUser.objects.filter(user=self, **kwargs)


class QuestionNode(DjangoObjectType):
    class Meta:
        model = Question
        # TODO better filtering class
        filter_fields = ('id', 'time_asked', 'is_rejected')
        fields = (
            'id',
            'text',
            'tags',
            'time_asked',
            'time_last_updated',
            'time_answered',
            'time_withdrawn',
            'time_rejected',
            'is_rejected',
            'queue',
            'rejected_by',
            'asker',
            'answerer',
        )
        interfaces = (relay.Node,)

    rejected_reason = graphene.Field(QuestionRejectionReasonType, required=True)


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
            'is_archived',
            'invite_only',
        )
        fields = (
            'id',
            'name',
            'department',
            'year',
            'is_archived',
            'invite_only',
        )
        interfaces = (relay.Node,)

    semester = graphene.Field(SemesterType, required=True)
    course_users = DjangoFilterConnectionField(CourseUserNode)
    queues = DjangoFilterConnectionField(QueueNode)

    def resolve_course_users(self, info, **kwargs):
        return CourseUser.objects.filter(course=self, **kwargs)

    def resolve_queues(self, info, **kwargs):
        return Queue.objects.filter(course=self, **kwargs)



class Query(graphene.ObjectType):
    # node = relay.Node.Field()


    # users = DjangoFilterConnectionField(UserNode)
    # users = graphene.List(UserNode)
    user = relay.Node.Field(UserNode)
    users = DjangoFilterConnectionField(UserNode)

    # course_user = graphene.Field(CourseUserNode)
    # course_users = DjangoFilterField(CourseUserNode)

    course = relay.Node.Field(CourseNode)
    # courses = DjangoFilterConnectionField(CourseNode)
    # courses = graphene.List(CourseNode)
    # courses = DjangoFilterField(CourseNode)

    queue = relay.Node.Field(QueueNode)


    # def resolve_user(self, info, email, id):
    #     return User.objects.filter(email=email, id=id)

    # def resolve_course_users(self, info, kind, id):
    #     return CourseUser.objects.filter(kind=kind, id=id)

    # def resolve_all_courses(self, info, **kwargs):
    #     # We can easily optimize query count in the resolve method
    #     return Course.objects.all()
    #
    # def resolve_all_course_users(self, info, **kwargs):
    #     return CourseUser.objects.select_related('course').select_related('user').all()
