from django.core.validators import validate_email
from ohq.models import Membership, MembershipInvite
from django.contrib.auth import get_user_model

User = get_user_model()


def filter_emails(course, emails):
    # Validate emails
    for email in emails:
        validate_email(email)

    # Remove invitees already in class
    existing = Membership.objects.filter(
        course=course, user__email__in=emails
    ).values_list("user__email", flat=True)

    emails = list(set(emails) - set(existing))

    existing = MembershipInvite.objects.filter(
        course=course, email__in=emails
    ).values_list("email", flat=True)
    emails = list(set(emails) - set(existing))

    return emails


def invite_emails(course, emails, kind):
    # Directly add invitees with existing accounts
    users = User.objects.filter(email__in=emails)
    for user in users:
        membership = Membership.objects.create(course=course, user=user, kind=kind)
        membership.send_email()

    # Create membership invites for invitees without an account
    emails = list(set(emails) - set(users.values_list("email", flat=True)))
    for email in emails:
        invite = MembershipInvite.objects.create(email=email, course=course, kind=kind)
        invite.send_email()
