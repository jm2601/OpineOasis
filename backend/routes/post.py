import mimetypes
import os

from flask import Blueprint, jsonify, send_file
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

post_blueprint = Blueprint("post_blueprint", __name__)


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
