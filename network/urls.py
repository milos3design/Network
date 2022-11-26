
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),
    path("profile/<str:username>", views.profile, name="profile"),

    # API return
    path("posts/<str:type>", views.posts, name="posts"),
    path("compose", views.compose, name="compose"),
    path("edit", views.edit, name="edit"),
    path("follow", views.follow, name="follow")
]
