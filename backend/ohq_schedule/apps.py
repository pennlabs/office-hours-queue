from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class OHQScheduleConfig(AppConfig):
    name = "ohq_schedule"
    verbose_name = _("ohq_schedules")
    default_auto_field = "django.db.models.AutoField"
