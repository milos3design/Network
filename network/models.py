from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("self", related_name="followed_by", blank = True, symmetrical=False)

    def __str__(self):
        return f"Id: {self.id} User: {self.username}"


class Post(models.Model):
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="authors")
    text = models.TextField(max_length=512, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likers = models.ManyToManyField("User", blank=True, related_name="liked")

    def __str__(self):
        return f"Id: {self.id} by {self.author.username} on {self.timestamp}"

    def serialize(self, logged=None):
        return {
            "id": self.id,
            "author": self.author.username,
            "text": self.text,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likers": [author.username for author in self.likers.all()]
        }
