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

    kind = graphene.Field(CourseUserKindType, required=True)
    rejected_questions = DjangoFilterConnectionField(lambda: QuestionNode)
    asked_questions = DjangoFilterConnectionField(lambda: QuestionNode)
    answered_questions = DjangoFilterConnectionField(lambda: QuestionNode)

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
            'description',
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


class JoinableCourseNode(DjangoObjectType):
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


class Query(graphene.ObjectType):
    # node = relay.Node.Field()


    # users = DjangoFilterConnectionField(UserNode)
    # users = graphene.List(UserNode)
    user = relay.Node.Field(UserNode)
    users = DjangoFilterConnectionField(UserNode)

    # course_user = graphene.Field(CourseUserNode)
    # course_users = DjangoFilterField(CourseUserNode)

    course = relay.Node.Field(CourseNode)
    joinable_courses = DjangoFilterConnectionField(JoinableCourseNode)
    # courses = graphene.List(CourseNode)
    # courses = DjangoFilterField(CourseNode)

    def resolve_joinable_courses(self, info, **kwargs):
        return Course.objects.filter(invite_only=False, **kwargs)

    queue = relay.Node.Field(QueueNode)


    # def resolve_user(self, info, email, id):
    #     return User.objects.filter(email=email, id=id)

    # def resolve_course_users(self, info, kind, id):
    #     return CourseUser.objects.filter(kind=kind, id=id)


    #
    # def resolve_all_course_users(self, info, **kwargs):
    #     return CourseUser.objects.select_related('course').select_related('user').all()

class CreateUserInput(graphene.InputObjectType):
    full_name = graphene.String(required=True)
    preferred_name = graphene.String(required=True)
    email = graphene.String(required=True)
    phone_number = graphene.String(required=False)

class CreateUserResponse(graphene.ObjectType):
    user = graphene.Field(UserNode, required=True)

class CreateUser(graphene.Mutation):
    class Arguments:
        input = CreateUserInput(required=True)

    Output = CreateUserResponse

    @staticmethod
    def mutate(root, info, input):
        user = User.objects.create(
            full_name=input.full_name,
            preferred_name=input.preferred_name,
            email=input.email,
            phone_number=input.phone_number,
        )

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


class CreateCourse(graphene.Mutation):
    class Arguments:
        input = CreateCourseInput(required=True)

    Output = CreateCourseResponse

    @staticmethod
    def mutate(root, info, input):
        course = Course.objects.create(
            name=input.name,
            department=input.department,
            description=input.description or "",
            year=input.year,
            semester=input.semester,
            invite_only=input.invite_only,
        )

        return CreateCourseResponse(course=course)


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
        # TODO check permissions
        course = Queue.objects.create(
            name=input.name,
            description=input.description or "",
            tags=input.tags,
            start_end_times=input.start_end_times,
            course=Course.objects.get(pk=from_global_id(input.course_id)[1]),
        )

        return CreateQueueResponse(course=course)


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
        # TODO check permissions
        course_user = CourseUser.objects.create(
            user=User.objects.get(pk=from_global_id(input.user_id)[1]),
            course=Course.objects.get(pk=from_global_id(input.course_id)[1]),
            kind=input.kind,
        )

        return AddUserToCourseResponse(course_user=course_user)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    create_course = CreateCourse.Field()
    create_queue = CreateQueue.Field()
    add_student_to_course = AddUserToCourse.Field()
