import os

from PIL import Image
from flask import Blueprint, jsonify, send_file, send_from_directory
from sqlalchemy import func
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

user_blueprint = Blueprint("user_blueprint", __name__, static_folder="../../frontend/dist", static_url_path="/")


@user_blueprint.route("/user", methods=["GET"])
def user_get_view():
    # We don't know the user duh
    return redirect("/")


@user_blueprint.route("/user/<int:user_id>", methods=["GET"])
def user_get_view_id(user_id):
    current_app.logger.info("Reading from user")
    # This is for views, don't actually need the ID
    return send_from_directory(user_blueprint.static_folder, "user/index.html")


@user_blueprint.route("/api/user/<int:user_id>", methods=["GET"])
def user_update(user_id):
    current_app.logger.info("Reading from user")

    current_user = get_user(request)
    current_user_id = current_user.id if current_user is not None else None

    find_user = db.session.query(User).filter(User.id == user_id).first()
    posts = db.session.query(Post, User).filter(Post.user == user_id, User.id == Post.user).order_by(Post.date.desc()).all()
    output = {
        "user": {
            "id": find_user.id,
            "username": find_user.username,
            "name": find_user.name,
            "avatar": find_user.profile_picture
        },
        "posts": [{
            "id": post.id,
            "community": post.community,
            "title": post.title,
            "text": post.text,
            "date": post.date,
            "image": post.image,
            "votes": db.session.query(func.coalesce(func.sum(PostVote.vote), 0)).filter(PostVote.post == post.id).scalar(),
            "vote": db.session.query(func.coalesce(PostVote.vote, 0)).filter(PostVote.post == post.id, PostVote.user == current_user_id).scalar(),
            "comments": db.session.query(func.coalesce(func.count(Comment.id), 0)).filter(Comment.post == post.id).scalar(),
            "user": {
                "id": user.id,
                "username": user.username,
                "name": user.name,
                "avatar": user.profile_picture
            }
        } for post, user in posts]
    }

    return jsonify(output), 200
