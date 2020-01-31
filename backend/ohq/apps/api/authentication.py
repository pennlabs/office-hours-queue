from django.conf import settings

from firebase_admin import auth

from .apps import firebase_app
from .models import AuthUser


class FirebaseAuthentication:

    def authenticate(self, request, **kwargs):
        if (settings.DEBUG):
            return AuthUser.objects.get(firebase_uid="E3UXVSfwZOf0VPw9p7XiaZqcoVE3")
        decoded_token = self._get_auth_token(request)
        if decoded_token:
            return self._get_user_from_token(decoded_token)
        else:
            return None

    def get_user(self, user_pk):
        try:
            return AuthUser.objects.get(pk=user_pk)
        except AuthUser.DoesNotExist:
            return None

    def _get_auth_token(self, request):
        encoded_token = request.META.get('HTTP_AUTHORIZATION')
        decoded_token = None
        try:
            decoded_token = auth.verify_id_token(
                encoded_token.split("Bearer ")[1],
                app=firebase_app,
                check_revoked=True,
            )
        except ValueError:
            pass
        except AttributeError:
            pass
        except auth.InvalidIdTokenError:
            pass
        return decoded_token

    def _get_user_from_token(self, decoded_token):
        firebase_uid = decoded_token.get('uid')
        try:
            return AuthUser.objects.get(firebase_uid=firebase_uid)
        except AuthUser.DoesNotExist:
            user = auth.get_user(firebase_uid)
            return AuthUser.objects.create_user(firebase_uid, user.email)
