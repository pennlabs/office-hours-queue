# Generated by Django 3.1.7 on 2021-09-12 16:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0011_merge_20210415_2110"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="student_descriptor",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
