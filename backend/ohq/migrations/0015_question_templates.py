from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("ohq", "0014_question_student_descriptor"),
    ]

    operations = [
        migrations.AddField(
            model_name="queue", name="question_template", field=models.TextField(),
        ),
    ]
