from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from djangorestframework_camel_case.render import CamelCaseJSONRenderer
from rest_framework.schemas import get_schema_view


admin.site.site_header = "Office Hours Queue Admin"

urlpatterns = [
    path("", include("ohq.urls")),
    path("accounts/", include("accounts.urls", namespace="accounts")),
    path(
        "openapi/",
        get_schema_view(
            title="Office Hours Queue Documentation",
            public=True,
            renderer_classes=[CamelCaseJSONRenderer],
        ),
        name="openapi-schema",
    ),
    path(
        "documentation/",
        TemplateView.as_view(
            template_name="redoc.html", extra_context={"schema_url": "openapi-schema"}
        ),
        name="documentation",
    ),
]

urlpatterns = [
    path("api/", include(urlpatterns)),
    path("admin/", admin.site.urls),
]

if settings.DEBUG:  # pragma: no cover
    try:
        import debug_toolbar
    except ImportError:
        debug_toolbar = None

    if debug_toolbar is not None:
        urlpatterns = [
            path("__debug__/", include(debug_toolbar.urls)),
            path("emailpreview/", include("email_tools.urls")),
        ] + urlpatterns
