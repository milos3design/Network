
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts_view", views.posts_view, name="posts_view"),

    path("posts/<str:type>", views.posts, name="posts"),
    #path("/<str:profile>", views.profile, name="profile")
]
