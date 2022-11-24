import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post

# Index shows all posts
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

        # Ensure that username "anonimno" can't be used, as it's used
        # in templates for passing non regisetered user to js
        if username == "anonimno":
            return render(request, "network/register.html", {
                "message": "Username can't be 'anonimno'."
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


# View posts for following link
def following(request):
    return render(request, "network/following.html")


# View posts for following link
def profile(request, username):
    # https://adamj.eu/tech/2020/02/18/safely-including-data-for-javascript-in-a-django-template/
    return render(request, "network/profile.html", context={"profile_username": username})


@login_required
def compose(request):
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    username = data.get("author", "")
    text = data.get("text", "")
    if text == "":
        return JsonResponse({"error": "You must type something."}, status=400)
    post = Post(
        author = User.objects.get(username=username),
        text = text
    )
    post.save()
    return JsonResponse({"message": "Success."}, status=201)


# Return JSON with posts - posts API route
def posts(request, type):
    if type == "all":
        posts = Post.objects.all()
    elif type == "following":
        if request.user.is_authenticated:
            # https://docs.djangoproject.com/en/3.0/ref/models/querysets/#in
            posts = Post.objects.filter(author__in=request.user.following.all())
        else:
            return JsonResponse({"error": "You must be logged in."}, status=400)
    else:
        if User.objects.filter(username=type).exists():
            profile_username_id = User.objects.get(username=type)
            posts = Post.objects.filter(author=profile_username_id)
        else:
            return JsonResponse({"error": "Invalid profile."}, status=400)
    
    posts = posts.order_by("-timestamp").all()
    logged = request.user if request.user.is_authenticated else None
    return JsonResponse([post.serialize(logged=logged) for post in posts], safe=False)



def edit(request):
    # Composing a new post must be via POST
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    id = data.get("id", "")
    username = data.get("username", "")
    text = data.get("text", "")
    print(text)
    update_post = Post.objects.get(id=id)

    if update_post.author.id != request.user.id:
        return JsonResponse({"error": "Only author of the post can edit it."}, status=400)

    update_post.text = text
    update_post.save()

    return JsonResponse({"message": "Success."}, status=201)