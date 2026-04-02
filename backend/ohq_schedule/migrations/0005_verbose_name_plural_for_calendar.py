from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("ohq_schedule", "0004_text_fields_not_null")]

    operations = [
        migrations.AlterModelOptions(
            name="calendar",
            options={"verbose_name": "calendar", "verbose_name_plural": "calendars"},
        )
    ]
