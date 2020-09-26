from django.urls import path
from rest_live.consumers import SubscriptionConsumer

websocket_urlpatterns = [
    path("api/ws/subscribe/", SubscriptionConsumer, name="subscriptions"),
]
