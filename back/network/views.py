from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def posts_view(request):
    return render(request, "network/posts.html")



def posts(request, type):
    
    if type == "all":
        posts = Post.objects.all()
    elif type == "following":
        if request.user.is_authenticated:
            posts = Post.objects.filter(author__in=request.user.following.all())
        else:
            return JsonResponse({"error": "You must be logged in."}, status=400)
    else:
        if type in User.objects.username:
            Post.objects.filter(author=request.user)
        else:
            return JsonResponse({"error": "Invalid profile."}, status=400)
    
    posts = posts.order_by("-timestamp").all()
    logged = request.user if request.user.is_authenticated else None
    return JsonResponse([post.serialize(logged=logged) for post in posts], safe=False)