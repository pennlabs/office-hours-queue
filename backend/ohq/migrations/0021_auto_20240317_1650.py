# Generated by Django 3.1.7 on 2024-03-17 16:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ohq', '0020_question_image'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='image',
        ),
        migrations.CreateModel(
            name='QuestionFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='question_files/')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='ohq.question')),
            ],
        ),
    ]
