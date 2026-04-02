import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("ohq_schedule", "0010_events_set_missing_calendar")]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="calendar",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                to="ohq_schedule.Calendar",
                verbose_name="calendar",
            ),
        )
    ]
