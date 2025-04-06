import os

import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration

from officehoursqueue.settings.base import *  # noqa: F401, F403
from officehoursqueue.settings.base import DOMAINS, REDIS_URL


DEBUG = False

# Honour the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Allow production host headers
ALLOWED_HOSTS = DOMAINS + [
    '*.modal.run',
    '*.modal.live',
    'localhost',
    '127.0.0.1'
]

# Make sure SECRET_KEY is set to a secret in production
SECRET_KEY = os.environ.get("SECRET_KEY", None)

# Sentry settings
SENTRY_URL = os.environ.get("SENTRY_URL", "")
sentry_sdk.init(dsn=SENTRY_URL, integrations=[CeleryIntegration(), DjangoIntegration()])

# DLA settings
PLATFORM_ACCOUNTS = {"ADMIN_PERMISSION": "ohq_admin"}

# Email client settings
EMAIL_HOST = os.getenv("SMTP_HOST")
EMAIL_PORT = int(os.getenv("SMTP_PORT", 587))
EMAIL_HOST_USER = os.getenv("SMTP_USERNAME")
EMAIL_HOST_PASSWORD = os.getenv("SMTP_PASSWORD")
EMAIL_USE_TLS = True

# Redis Channel Layer
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {"hosts": [REDIS_URL]},
    },
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'https://*.modal.run',
    'https://*.modal.live',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
] + [f'https://{domain}' for domain in DOMAINS]

# CSRF settings
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# Proxy settings
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True 
