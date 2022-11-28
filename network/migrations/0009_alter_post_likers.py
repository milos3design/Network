# Generated by Django 4.1.1 on 2022-11-28 06:20

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_alter_user_following'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='likers',
            field=models.ManyToManyField(blank=True, related_name='liked_by', to=settings.AUTH_USER_MODEL),
        ),
    ]
