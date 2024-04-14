from django.urls import path

from ohq.urls import realtime_router


websocket_urlpatterns = [
    path("api/ws/subscribe/", realtime_router.as_consumer().as_asgi(), name="subscriptions"),
]
