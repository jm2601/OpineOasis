import mimetypes
import os

from flask import Blueprint, jsonify, send_file, send_from_directory
from sqlalchemy import func
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

community_blueprint = Blueprint("community_blueprint", __name__, static_folder="../../frontend/dist", static_url_path="/")


@community_blueprint.route("/community", methods=["GET"])
def community_get():
    current_app.logger.info("Reading from community")
    return redirect("/community/1")


@community_blueprint.route("/community/<int:community_id>", methods=["GET"])
def community_get_specific(community_id):
    current_app.logger.info("Reading from community")
    return send_from_directory(community_blueprint.static_folder, "community/index.html")


@community_blueprint.route("/api/community", methods=["GET"])
def community_get_api():
    communities = db.session.query(Community, User).filter(Community.owner == User.id).all()

    output = [
        {
            "id": community.id,
            "name": community.name,
            "owner": {
                "id": user.id,
                "username": user.username,
                "name": user.name,
                "avatar": user.profile_picture
            },
            "time_created": community.time_created,
        }
        for community, user in communities]

    return jsonify(output), 200



@community_blueprint.route("/api/community/<int:community_id>", methods=["GET"])
def community_get_posts_api(community_id):
    current_user = get_user(request)
    user_id = current_user.id if current_user is not None else None

    posts = db.session.query(Post, User).filter(Post.community == community_id, User.id == Post.user).order_by(Post.date.desc()).all()
    output = [{
        "id": post.id,
        "title": post.title,
        "text": post.text,
        "date": post.date,
        "image": post.image,
        "votes": db.session.query(func.coalesce(func.sum(PostVote.vote), 0)).filter(PostVote.post == post.id).scalar(),
        "vote": db.session.query(func.coalesce(PostVote.vote, 0)).filter(PostVote.post == post.id, PostVote.user == user_id).scalar(),
        "comments": db.session.query(func.coalesce(func.count(Comment.id), 0)).filter(Comment.post == post.id).scalar(),
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "avatar": user.profile_picture
        }
    } for post, user in posts]

    return jsonify(output), 200
