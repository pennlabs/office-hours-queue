# Generated by Django 5.0.3 on 2024-11-15 17:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0023_course_reviews"),
    ]

    operations = [
        migrations.RenameField(
            model_name="course",
            old_name="reviews",
            new_name="allow_reviews",
        ),
    ]
