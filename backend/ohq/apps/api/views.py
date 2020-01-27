from django.contrib.auth.mixins import AccessMixin
from graphene_django.views import GraphQLView

from django.contrib.auth import authenticate


class AuthRequiredMixin(AccessMixin):
    """Verify that the current user is authenticated."""
    def dispatch(self, request, *args, **kwargs):
        if not authenticate(request):
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)


class PrivateGraphQLView(AuthRequiredMixin, GraphQLView):
    raise_exception = True
