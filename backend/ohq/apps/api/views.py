import json

from django.http import HttpResponse
from django.contrib.auth import authenticate

from graphene_django.views import GraphQLView


class PrivateGraphQLView(GraphQLView):

    def dispatch(self, request, *args, **kwargs):
        if request.method.lower() == "post" and not authenticate(request):
            content = {
                "errors": [{"message": "Forbidden"}],
            }
            return HttpResponse(
                status=403, content=json.dumps(content), content_type="application/json"
            )
        return super().dispatch(request, *args, **kwargs)
