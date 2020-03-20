from decouple import config
from datetime import datetime, timezone
from firebase_admin import auth
from django.db import transaction

from ohq.apps.api.schema.types import *
from ohq.apps.api.util import generate_sms_verification_code
from ohq.apps.api.util.errors import (
    empty_update_error,
    empty_string_error,
    email_not_upenn_error,
    phone_number_not_set_error,
    phone_number_already_verified_error,
    verification_code_incorrect_error,
    verification_code_expired_error,
    verification_resend_wait_error,
)
from ohq.apps.api.util.twilio import send_verification_sms


class CreateUserInput(graphene.InputObjectType):
    full_name = graphene.String(required=True)
    preferred_name = graphene.String(required=True)
    phone_number = graphene.String(required=False)
    sms_notifications_enabled = graphene.Boolean(required=False)


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
        if (
            config("ENVIRONMENT", default="prod") == "prod" and
            not info.context.user.email.endswith("upenn.edu")
        ):
            raise email_not_upenn_error
        with transaction.atomic():
            user = User(
                full_name=input.full_name,
                preferred_name=input.preferred_name,
                email=info.context.user.email,
                sms_notifications_enabled=input.sms_notifications_enabled or False,
                phone_number=input.phone_number,
                sms_verification_code=(
                    generate_sms_verification_code() if input.phone_number else None
                ),
                sms_verification_timestamp=(
                    datetime.now(timezone.utc) if input.phone_number else None
                ),
                sms_verified=False if input.phone_number else None,
                auth_user=info.context.user,
            )
            user.clean_fields()

            # Won't send if not set
            send_verification_sms(user)

            invites = InvitedCourseUser.objects.filter(email=info.context.user.email)
            new_course_users = [
                CourseUser(
                    user=user,
                    course=invite.course,
                    kind=invite.kind,
                    invited_by=invite.invited_by,
                ) for invite in invites
            ]
            user.save()
            CourseUser.objects.bulk_create(new_course_users)
            invites.delete()
            auth.set_custom_user_claims(
                info.context.user.firebase_uid,
                {"hasUserObject": True},
            )

        return CreateUserResponse(user=user)


class UpdateUserInput(graphene.InputObjectType):
    full_name = graphene.String(required=False)
    preferred_name = graphene.String(required=False)
    phone_number = graphene.String(required=False)
    sms_notifications_enabled = graphene.Boolean(required=False)


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
            if input.sms_notifications_enabled is not None:
                user.sms_notifications_enabled = input.sms_notifications_enabled
            if input.phone_number is not None and input.phone_number != user.phone_number:
                user.phone_number = input.phone_number
                user.sms_verified = False
                user.sms_verification_code = generate_sms_verification_code()
                user.sms_verification_timestamp = datetime.now()
                should_send_sms_verification = True
            else:
                should_send_sms_verification = False

            user.clean_fields()
            user.save()

            if should_send_sms_verification:
                send_verification_sms(user)

        return UpdateUserResponse(user=user)


class SendSMSVerificationInput(graphene.InputObjectType):
    _ = graphene.Boolean(required=False)


class SendSMSVerificationResponse(graphene.ObjectType):
    success = graphene.Boolean(required=True)


class SendSMSVerification(graphene.Mutation):
    class Arguments:
        input = SendSMSVerificationInput(required=True)

    Output = SendSMSVerificationResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()

            if not user.phone_number:
                raise phone_number_not_set_error
            if user.sms_verified:
                raise phone_number_already_verified_error
            if (
                user.sms_verification_timestamp and
                (datetime.now(timezone.utc) - user.sms_verification_timestamp).total_seconds() < 30
            ):
                raise verification_resend_wait_error

            user.sms_verification_code = generate_sms_verification_code()
            user.sms_verification_timestamp = datetime.now(timezone.utc)
            user.save()
            send_verification_sms(user)
        return SendSMSVerificationResponse(success=True)


class VerifyPhoneNumberInput(graphene.InputObjectType):
    code = graphene.String(required=True)


class VerifyPhoneNumberResponse(graphene.ObjectType):
    success = graphene.Boolean(required=True)


class VerifyPhoneNumber(graphene.Mutation):
    class Arguments:
        input = VerifyPhoneNumberInput(required=True)

    Output = VerifyPhoneNumberResponse

    @staticmethod
    def mutate(root, info, input):
        with transaction.atomic():
            user = info.context.user.get_user()

            if not user.phone_number:
                raise phone_number_not_set_error
            if user.sms_verified:
                raise phone_number_already_verified_error
            if (
                (datetime.now(timezone.utc) - user.sms_verification_timestamp).total_seconds() >
                User.SMS_VERIFICATION_EXPIRATION_MINUTES * 60
            ):
                raise verification_code_expired_error
            if user.sms_verification_code != input.code:
                raise verification_code_incorrect_error

            user.sms_verified = True
            user.sms_verification_code = None
            user.sms_verification_timestamp = None
            user.save()
            send_verification_sms(user)

        return VerifyPhoneNumberResponse(success=True)
