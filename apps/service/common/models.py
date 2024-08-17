from django.db import models


class Industry(models.Model):
    name = models.CharField(unique=True, max_length=250)

    class Meta:
        db_table = 'industry'


class Skill(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'skill'


class SlackMessageLogs(models.Model):
    message = models.TextField()
    created_time = models.DateTimeField(auto_now_add=True)
    delivered = models.BooleanField(default=False)

    class Meta:
        db_table = 'slack_message_logs'
