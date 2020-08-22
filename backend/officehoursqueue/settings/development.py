import os

from officehoursqueue.settings.base import *  # noqa: F401, F403
from officehoursqueue.settings.base import INSTALLED_APPS, MIDDLEWARE


# Development extensions
INSTALLED_APPS += ["django_extensions", "debug_toolbar"]

MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE
INTERNAL_IPS = ["127.0.0.1"]

# Allow http callback for DLA
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Use the console for email in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
