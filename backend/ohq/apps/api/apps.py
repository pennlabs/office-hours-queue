from django.apps import AppConfig
from django.conf import settings
import firebase_admin


firebase_app = None


class ApiConfig(AppConfig):
    name = 'ohq.apps.api'

    def ready(self):
        credentials = firebase_admin.credentials.Certificate(settings.FIREBASE_KEY_FILE)
        global firebase_app
        firebase_app = firebase_admin.initialize_app(credentials)
