# Generated by Django 4.1.1 on 2022-11-19 21:38

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='likers',
            field=models.ManyToManyField(blank=True, null=True, related_name='liked', to=settings.AUTH_USER_MODEL),
        ),
    ]