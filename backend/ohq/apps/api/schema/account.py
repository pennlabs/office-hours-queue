from django.db import transaction

from ohq.apps.api.schema.types import *
from ohq.apps.api.util.errors import empty_update_error, empty_string_error


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
        if (
            not input.full_name or
            not input.preferred_name
        ):
            raise empty_string_error
        with transaction.atomic():
            user = User.objects.create(
                full_name=input.full_name,
                preferred_name=input.preferred_name,
                email=info.context.user.email,
                phone_number=input.phone_number,
                auth_user=info.context.user,
            )
            invites = InvitedCourseUser.objects.filter(email=info.context.user.email)
            new_course_users = [
                CourseUser(
                    user=user,
                    course=invite.course,
                    kind=invite.kind,
                    invited_by=invite.invited_by,
                ) for invite in invites
            ]
            CourseUser.objects.bulk_create(new_course_users)
            invites.delete()

        return CreateUserResponse(user=user)


class UpdateUserInput(graphene.InputObjectType):
    full_name = graphene.String(required=False)
    preferred_name = graphene.String(required=False)
    phone_number = graphene.String(required=False)


class UpdateUserResponse(graphene.ObjectType):
    user = graphene.Field(UserNode, required=True)


class UpdateUser(graphene.Mutation):
    class Arguments:
        input = UpdateUserInput(required=True)

    Output = UpdateUserResponse

    @staticmethod
    def mutate(root, info, input):
        if not input:
            raise empty_update_error
        if (
            (input.full_name is not None and not input.full_name) or
            (input.preferred_name is not None and not input.preferred_name)
        ):
            raise empty_string_error
        with transaction.atomic():
            user = info.context.user.get_user()
            if input.full_name is not None:
                user.full_name = input.full_name
            if input.preferred_name is not None:
                user.preferred_name = input.preferred_name
            if input.phone_number is not None:
                user.phone_number = input.phone_number
            user.save()

        return UpdateUserResponse(user=user)
