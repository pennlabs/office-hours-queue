# Generated by Django 5.0.3 on 2024-10-13 05:41

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0020_auto_20240326_0226"),
        ("schedule", "0015_auto_20240825_0015"),
    ]

    operations = [
        migrations.CreateModel(
            name="Occurrence",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("title", models.CharField(blank=True, max_length=255, verbose_name="title")),
                ("location", models.CharField(blank=True, max_length=255, verbose_name="location")),
                ("description", models.TextField(blank=True, verbose_name="description")),
                ("start", models.DateTimeField(db_index=True, verbose_name="start")),
                ("end", models.DateTimeField(db_index=True, verbose_name="end")),
                ("cancelled", models.BooleanField(default=False, verbose_name="cancelled")),
                ("original_start", models.DateTimeField(verbose_name="original start")),
                ("original_end", models.DateTimeField(verbose_name="original end")),
                ("created_on", models.DateTimeField(auto_now_add=True, verbose_name="created on")),
                ("updated_on", models.DateTimeField(auto_now=True, verbose_name="updated on")),
                (
                    "interval",
                    models.IntegerField(
                        blank=True,
                        validators=[
                            django.core.validators.MinValueValidator(5),
                            django.core.validators.MaxValueValidator(60),
                        ],
                        verbose_name="interval",
                    ),
                ),
                (
                    "event",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="test_occurrence",
                        to="schedule.event",
                        verbose_name="event",
                    ),
                ),
            ],
            options={
                "verbose_name": "occurrence",
                "verbose_name_plural": "occurrences",
                "index_together": {("start", "end")},
            },
        ),
    ]