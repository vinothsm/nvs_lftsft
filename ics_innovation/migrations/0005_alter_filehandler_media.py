# Generated by Django 4.0.4 on 2022-05-26 09:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ics_innovation', '0004_alter_filehandler_media'),
    ]

    operations = [
        migrations.AlterField(
            model_name='filehandler',
            name='media',
            field=models.FileField(blank=True, null=True, upload_to=''),
        ),
    ]
