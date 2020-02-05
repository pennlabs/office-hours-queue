from graphql_relay.node.node import from_global_id

from django.db import transaction

from ohq.apps.api.schema.types import *


class CreateCourseInput(graphene.InputObjectType):
    name = graphene.String(required=True)
    department = graphene.String(required=True)
    description = graphene.String(required=False)
    year = graphene.Int(required=True)
    semester = graphene.Field(SemesterType, required=True)
    invite_only = graphene.Boolean(required=True)
    course_user_kind = graphene.Field(CourseUserKindType, required=False)


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
                kind=input.course_user_kind or CourseUserKind.PROFESSOR.name,
            )

        return CreateCourseResponse(course=course, course_user=course_user)


class UpdateCourseInput(graphene.InputObjectType):
    course_id = graphene.ID(required=True)
    name = graphene.String(required=False)
    department = graphene.String(required=False)
    description = graphene.String(required=False)
    year = graphene.Int(required=False)
    semester = graphene.Field(SemesterType, required=False)
    invite_only = graphene.Boolean(required=False)


class UpdateCourseResponse(graphene.ObjectType):
    course = graphene.Field(CourseNode, required=True)


class UpdateCourse(graphene.Mutation):
    class Arguments:
        input = UpdateCourseInput(required=True)

    Output = UpdateCourseResponse

    @staticmethod
    def mutate(root, info, input):
        if not input:
            raise ValueError
        with transaction.atomic():
            user = info.context.user.get_user()
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise PermissionError

            if input.name:
                course.name = input.name
            if input.department:
                course.department = input.department
            if input.description:
                course.description = input.description
            if input.year:
                course.year = input.year
            if input.semester:
                course.semester = input.semester
            if input.invite_only:
                course.invite_only = input.invite_only
            course.save()
        return UpdateCourseResponse(course=course)


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
            user = info.context.user.get_user()
            course = Course.objects.get(pk=from_global_id(input.course_id)[1])
            if not CourseUser.objects.filter(
                user=user,
                course=course,
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise PermissionError

            course_user = CourseUser.objects.create(
                user=User.objects.get(pk=from_global_id(input.user_id)[1]),
                course=course,
                kind=input.kind,
                invited_by=user,
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
    kind = graphene.Field(CourseUserKindType, required=True)


class InviteEmailResponse(graphene.ObjectType):
    invited_course_user = graphene.Field(InvitedCourseUserNode, required=False)


class InviteEmail(graphene.Mutation):
    class Arguments:
        input = InviteEmailInput(required=False)

    Output = InviteEmailResponse

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

            invited_course_user = InvitedCourseUser.objects.create(
                email=input.email,
                course=course,
                invited_by=user,
                kind=input.kind,
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
                kind__in=CourseUserKind.leadership(),
            ).exists():
                raise PermissionError

            course_user_to_remove = CourseUser.objects.get(
                user=User.objects.get(pk=from_global_id(input.user_id)[1]),
                course=course,
            )
            if (
                course_user_to_remove.kind in CourseUserKind.leadership() and
                CourseUser.objects.filter(course=course, kind=CourseUserKind.leadership()).count()
                    == 1
            ):
                raise ValueError

            course_user_to_remove.delete()

        return RemoveUserFromCourseResponse(success=True)
