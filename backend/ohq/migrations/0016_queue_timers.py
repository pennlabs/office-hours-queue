from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0015_question_templates"),
    ]

    operations = [
        migrations.AddField(
            model_name="queue",
            name="fst_timer",
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name="queue",
            name="snd_timer",
            field=models.IntegerField(default=0),
        ),
    ]
