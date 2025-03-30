# Generated by Django 5.0.3 on 2024-10-13 17:12

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0021_occurrence"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Booking",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("start", models.DateTimeField(db_index=True, verbose_name="start")),
                ("end", models.DateTimeField(db_index=True, verbose_name="end")),
                (
                    "occurrence",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="ohq.occurrence"
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
