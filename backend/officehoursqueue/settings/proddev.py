# Django config based off of production config, but with minor changes to ensure it works on dev machines

from officehoursqueue.settings.production import *

import officehoursqueue.settings.base as base

# No https on dev machines
SECURE_PROXY_SSL_HEADER = ()

# Prevents request rejection on dev machines
ALLOWED_HOSTS = ["*"]

# Use local login instead of UPenn's
PLATFORM_ACCOUNTS = base.PLATFORM_ACCOUNTS

# Allow http callback for DLA
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# Use the console for email in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
