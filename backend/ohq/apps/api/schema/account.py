from django.db import transaction

from ohq.apps.api.schema.types import *


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
                    invited_by=invite.invited_by,
                ))
            CourseUser.objects.bulk_create(new_course_users)
            invites.delete()

        return CreateUserResponse(user=user)

