import mimetypes
import os

from flask import Blueprint, jsonify, send_file
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

file_blueprint = Blueprint("file_blueprint", __name__)


@file_blueprint.route("/file", methods=["GET"])
def files_get():
    id = request.args.get("id")
    if id is None:
        return jsonify({"message": "Invalid request"}), 400

    file = db.session.query(File).filter(File.id == id).first()

    if file is None or not os.path.exists(os.path.join(current_app.config["UPLOAD_FOLDER"], str(file.id))):
        return jsonify({"message": "File not found"}), 404

    return send_file(os.path.join(current_app.config["UPLOAD_FOLDER"], str(file.id)), download_name=file.name,
                     mimetype=mimetypes.guess_type(file.name)[0])


@file_blueprint.route("/file", methods=["POST"])
def files_post():
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
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], str(new_file.id)))

    return jsonify({"message": "File uploaded successfully", "id": new_file.id}), 200


@file_blueprint.route("/file", methods=["DELETE"])
def files_delete():
    user = get_user(request)

    id = request.args.get("id")
    if id is None:
        return jsonify({"message": "Invalid request"}), 400

    file = db.session.query(File).filter(File.id == id).first()

    if file is None:
        return jsonify({"message": "File not found"}), 404
    if user.permission != UserType.ADMIN and user.id != file.owner:
        return jsonify({"message": "You do not have permission to delete this file"}), 403

    os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], str(file.id)))

    db.session.delete(file)
    db.session.commit()

    return jsonify({"message": "File deleted successfully"}), 200
