import mimetypes
import os

from flask import Blueprint, jsonify, send_file
from sqlalchemy import func
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

post_blueprint = Blueprint("post_blueprint", __name__)


@post_blueprint.route("/api/community/<int:community_id>/post/<int:post_id>", methods=["GET"])
def post_get(community_id, post_id):
    (post, user) = db.session.query(Post, User).filter(Post.community == community_id, Post.id == post_id, User.id == Post.user).first()
    output = {
        "id": post.id,
        "title": post.title,
        "text": post.text,
        "date": post.date,
        "image": post.image,
        "votes": db.session.query(func.sum(PostVote.vote)).filter(PostVote.post == post.id).scalar(),
        "user": {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "avatar": user.profile_picture
        }
    }

    return jsonify(output), 200


@post_blueprint.route("/api/community/<int:community_id>/post/<int:post_id>/vote", methods=["POST"])
def post_vote(community_id, post_id):
    user = get_user(request)

    if user is None:
        return jsonify({"message": "You must be logged in to vote"}), 401

    json = request.get_json()
    if json is None or "vote" not in json:
        return jsonify({"message": "Invalid request"}), 400

    vote = json["vote"]

    if vote != 1 and vote != -1 and vote != 0:
        return jsonify({"message": "Invalid request"}), 400

    post_vote_obj = db.session.query(PostVote).filter(PostVote.post == post_id, PostVote.user == user.id).first()
    if post_vote_obj is None:
        post_vote_obj = PostVote(post_id, user.id, int(vote))
        db.session.add(post_vote_obj)
    else:
        post_vote_obj.vote = vote

    db.session.commit()

    return jsonify({"message": "Vote successful"}), 200


@post_blueprint.route("/api/community/<int:community_id>/post", methods=["POST"])
def post_post(community_id):
    user = get_user(request)

    if user is None:
        return jsonify({"message": "You must be logged in to upload files"}), 401

    if "file" not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No file provided"}), 400

    new_file = File(secure_filename(file.filename), user.id, datetime.now().isoformat())
    db.session.add(new_file)
    db.session.commit()
    db.session.refresh(new_file)

    # Create configured directory
    if not os.path.exists(current_app.config["UPLOAD_FOLDER"]):
        os.makedirs(current_app.config["UPLOAD_FOLDER"])
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], new_file.id))

    return jsonify({"message": "File uploaded successfully", "id": new_file.id}), 200


@post_blueprint.route("/api/community/<int:community_id>/post/<int:post_id>", methods=["DELETE"])
def post_delete(community_id, post_id):
    user = get_user(request)

    id = request.args.get("id")
    if id is None:
        return jsonify({"message": "Invalid request"}), 400

    file = db.session.query(Post).filter(Post.id == id).first()

    if file is None:
        return jsonify({"message": "File not found"}), 404
    if user.permission != UserType.ADMIN and user.id != file.owner:
        return jsonify({"message": "You do not have permission to delete this file"}), 403

    os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], file.id))

    db.session.delete(file)
    db.session.commit()

    return jsonify({"message": "File deleted successfully"}), 200
