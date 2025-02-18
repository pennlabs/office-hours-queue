# Generated by Django 5.0.3 on 2024-10-11 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0020_auto_20240326_0226"),
    ]

    operations = [
        migrations.AddField(
            model_name="queue",
            name="question_timer_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="queue",
            name="question_timer_start_time",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
