# Generated by Django 4.0.4 on 2022-05-26 09:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ics_innovation', '0006_remove_filehandler_filepath'),
    ]

    operations = [
        migrations.AddField(
            model_name='filehandler',
            name='filepath',
            field=models.CharField(max_length=500, null=True),
        ),
    ]
