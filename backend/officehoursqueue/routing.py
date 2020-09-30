from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

import ohq.routing
import ohq.urls  # DO NOT DELETE THIS IMPORT!


# Django REST Live requires urls too be imported from the async entrypoint.

application = ProtocolTypeRouter(
    {
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(ohq.routing.websocket_urlpatterns))
        )
    }
)
