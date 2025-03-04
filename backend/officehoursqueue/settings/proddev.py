from officehoursqueue.settings.production import *

import officehoursqueue.settings.base as base

DEBUG = True

SECURE_PROXY_SSL_HEADER = ()

ALLOWED_HOSTS = ["*"]

PLATFORM_ACCOUNTS = base.PLATFORM_ACCOUNTS

# Allow http callback for DLA
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Use the console for email in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
