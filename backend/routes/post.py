import mimetypes
import os

from flask import Blueprint, jsonify, send_file, send_from_directory
from sqlalchemy import func
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

post_blueprint = Blueprint("post_blueprint", __name__, static_folder="../../frontend/dist", static_url_path="/")


@post_blueprint.route("/community/<int:community_id>/post/<int:post_id>", methods=["GET"])
def post_view_get(community_id, post_id):
    current_app.logger.info("Reading from post")
    return send_from_directory(post_blueprint.static_folder, "post/index.html")


@post_blueprint.route("/api/community/<int:community_id>/post/<int:post_id>", methods=["GET"])
def post_get(community_id, post_id):
    current_user = get_user(request)
    user_id = current_user.id if current_user is not None else None

    (post, user) = db.session.query(Post, User).filter(Post.community == community_id, Post.id == post_id,
                                                       User.id == Post.user).first()
    comments = db.session.query(Comment, User).filter(Comment.post == post.id, User.id == Comment.user).all()

    output = {
        "post": {
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
        },
        "comments": [
            {
                "id": comment.id,
                "text": comment.text,
                "date": comment.date,
                "user": {
                    "id": comment_user.id,
                    "username": comment_user.username,
                    "name": comment_user.name,
                    "avatar": comment_user.profile_picture
                },
                "replyTo": comment.reply_to,
                "votes": db.session.query(func.coalesce(func.sum(CommentVote.vote), 0)).filter(CommentVote.comment == comment.id).scalar(),
                "vote": db.session.query(func.coalesce(CommentVote.vote, 0)).filter(CommentVote.comment == comment.id, CommentVote.user == user_id).scalar(),
            }
            for comment, comment_user in comments]
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

    post = db.session.query(Post).filter(Post.id == post_id).first()
    if post is None:
        return jsonify({"message": "Post not found"}), 404

    post_vote_obj = db.session.query(PostVote).filter(PostVote.post == post_id, PostVote.user == user.id).first()
    if post_vote_obj is None:
        post_vote_obj = PostVote(post_id, user.id, int(vote))
        db.session.add(post_vote_obj)
    else:
        post_vote_obj.vote = vote

    db.session.commit()

    return jsonify({"message": "Vote successful"}), 200


@post_blueprint.route("/api/community/<int:community_id>/post/<int:post_id>/comment/<int:comment_id>/vote", methods=["POST"])
def comment_vote(community_id, post_id, comment_id):
    user = get_user(request)

    if user is None:
        return jsonify({"message": "You must be logged in to vote"}), 401

    json = request.get_json()
    if json is None or "vote" not in json:
        return jsonify({"message": "Invalid request"}), 400

    vote = json["vote"]

    if vote != 1 and vote != -1 and vote != 0:
        return jsonify({"message": "Invalid request"}), 400

    comment = db.session.query(Comment).filter(Comment.id == comment_id).first()
    if comment is None:
        return jsonify({"message": "Comment not found"}), 404

    comment_vote_obj = db.session.query(CommentVote).filter(CommentVote.comment == comment_id, CommentVote.user == user.id).first()
    if comment_vote_obj is None:
        comment_vote_obj = CommentVote(comment_id, user.id, int(vote))
        db.session.add(comment_vote_obj)
    else:
        comment_vote_obj.vote = vote

    db.session.commit()

    return jsonify({"message": "Vote successful"}), 200


@post_blueprint.route("/api/community/<int:community_id>/post/<int:post_id>/comment", methods=["POST"])
def comment_post(community_id, post_id):
    user = get_user(request)

    if user is None:
        return jsonify({"message": "You must be logged in to comment"}), 401

    json = request.get_json()
    if json is None or "text" not in json:
        return jsonify({"message": "Invalid request"}), 400

    text = json["text"]
    reply_to = json["replyTo"] if "replyTo" in json else None

    if reply_to is not None:
        try:
            reply_to = int(reply_to)
        except:
            return jsonify({"message": "Invalid request"}), 400

    post = db.session.query(Post).filter(Post.id == post_id).first()
    if post is None:
        return jsonify({"message": "Post not found"}), 404

    comment_reply = db.session.query(Comment).filter(Comment.id == reply_to).first()
    if reply_to is not None and comment_reply is None:
        return jsonify({"message": "Reply comment not found"}), 404

    comment = Comment(post_id, user.id, text, datetime.now().isoformat(), reply_to)
    db.session.add(comment)
    db.session.commit()
    db.session.refresh(comment)

    return jsonify({"message": "Comment successful", "id": comment.id}), 200


@post_blueprint.route("/api/community/<int:community_id>/post", methods=["POST"])
def post_post(community_id):
    user = get_user(request)

    if user is None:
        return jsonify({"message": "You must be logged in to upload files"}), 401

    if "title" not in request.form or "text" not in request.form:
        return jsonify({"message": "Invalid request"}), 400

    file_id = None

    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"message": "Filename not provided"}), 400

        new_file = File(secure_filename(file.filename), user.id, datetime.now().isoformat())
        db.session.add(new_file)
        db.session.commit()
        db.session.refresh(new_file)

        file_id = new_file.id

        # Create configured directory
        if not os.path.exists(current_app.config["UPLOAD_FOLDER"]):
            os.makedirs(current_app.config["UPLOAD_FOLDER"])
        file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], str(new_file.id)))

    new_post = Post(community_id, request.form["title"], datetime.now().isoformat(), request.form["text"], file_id, user.id)
    db.session.add(new_post)
    db.session.commit()
    db.session.refresh(new_post)

    return jsonify({"message": "Post created successfully", "id": new_post.id}), 200


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

    if os.path.exists(os.path.join(current_app.config["UPLOAD_FOLDER"], str(file.id))):
        os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], str(file.id)))

    db.session.delete(file)
    db.session.commit()

    return jsonify({"message": "File deleted successfully"}), 200
