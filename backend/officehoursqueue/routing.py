from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

import ohq.routing
# DO NOT DELETE THIS IMPORT! Django REST Live requires urls to be imported from async entrypoint.
import ohq.urls


application = ProtocolTypeRouter(
    {
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(URLRouter(ohq.routing.websocket_urlpatterns))
        )
    }
)
