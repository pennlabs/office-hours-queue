# Generated by Django 3.1.7 on 2021-10-31 16:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0016_auto_20211008_2136"),
    ]

    operations = [
        migrations.AlterField(
            model_name="queue",
            name="pin",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
