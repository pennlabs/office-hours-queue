from accounts.backends import LabsUserBackend

from ohq.models import Membership, MembershipInvite


class OHQBackend(LabsUserBackend):
    """
    A custom DLA backend that converts Membership Invites into Memberships on user creation.
    """

    def post_authenticate(self, user, created, dictionary):
        if created:
            invites = MembershipInvite.objects.filter(email__istartswith=f"{user.username}@")

            for invite in invites:
                Membership.objects.create(course=invite.course, kind=invite.kind, user=user)

            invites.delete()
            user.save()
