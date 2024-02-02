from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.db.models import Q

from ohq.models import Membership, MembershipInvite


User = get_user_model()


def parse_and_send_invites(course, emails, kind):
    """
    Take in a list of emails, validate them. Then:
    1. Create memberships for emails that belong to an existing user
    2. Send out membership invites to the remaining emails
    """

    # Validate emails
    for email in emails:
        validate_email(email)

    # Map of pennkey to invite email (which may be different from the user's email)
    email_map = {email.split("@")[0]: email for email in emails}

    # Remove users already invited
    existing = MembershipInvite.objects.filter(course=course, email__in=emails).values_list(
        "email", flat=True
    )
    emails = list(set(emails) - set(existing))

    # Generate final map of pennkey to email of users that need to be invited
    email_map = {email.split("@")[0]: email for email in emails}

    # Directly add invitees with existing accounts
    users = User.objects.filter(Q(email__in=emails) | Q(username__in=email_map.keys())).distinct()
    for user in users:
        # Check if user is already in course, create membership if not
        membership, created = Membership.objects.get_or_create(
            course=course, user=user, defaults={"kind": kind}
        )
        if not created:
            # If user is already in course and has different kind
            if membership.kind != kind:
                membership.kind = kind
                membership.save()
                membership.send_email()
            # If user is already in course and has same kind, do nothing
        else:
            # If user is not in course
            membership.send_email()
        del email_map[user.username]

    # Create membership invites for invitees without an account
    for email in email_map.values():
        invite = MembershipInvite.objects.create(email=email, course=course, kind=kind)
        invite.send_email()

    return (users.count(), len(email_map))
