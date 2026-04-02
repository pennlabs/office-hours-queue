import django

if django.VERSION < (3, 2):
    default_app_config = "ohq_schedule.apps.OHQScheduleConfig"
