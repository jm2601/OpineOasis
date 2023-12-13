import os

from PIL import Image
from flask import Blueprint, jsonify, send_file, send_from_directory
from sqlalchemy import func
from werkzeug.utils import secure_filename
from datetime import datetime
from models import *
from auth.utilities import get_user

settings_blueprint = Blueprint("settings_blueprint", __name__, static_folder="../../frontend/dist", static_url_path="/")


@settings_blueprint.route("/settings", methods=["GET"])
def settings_get_view():
    current_app.logger.info("Reading from settings")

    user = get_user(request)

    if user is None:
        return redirect("/login")

    return send_from_directory(settings_blueprint.static_folder, "settings/index.html")


@settings_blueprint.route("/settings", methods=["PUT"])
def settings_update():
    current_app.logger.info("Reading from settings")

    user = get_user(request)

    if user is None:
        return redirect("/login")

    if "avatar" in request.files:
        # Create file
        avatar = request.files["avatar"]
        if avatar.filename == "":
            return jsonify({"message": "No file provided"}), 400

        temp_file_name = secure_filename(avatar.filename)
        new_file = File(temp_file_name, user.id, datetime.now().isoformat())
        db.session.add(new_file)
        db.session.commit()
        db.session.refresh(new_file)

        # Create configured directory
        if not os.path.exists(current_app.config["UPLOAD_FOLDER"]):
            os.makedirs(current_app.config["UPLOAD_FOLDER"])

        avatar.save(os.path.join(current_app.config["UPLOAD_FOLDER"], temp_file_name))

        # Crop to square
        image = Image.open(os.path.join(current_app.config["UPLOAD_FOLDER"], temp_file_name))
        width, height = image.size

        if width > height:
            image = image.crop(((width - height) // 2, 0, (width + height) // 2, height))
        else:
            image = image.crop((0, (height - width) // 2, width, (height + width) // 2))

        image = image.resize((256, 256))
        image.save(os.path.join(current_app.config["UPLOAD_FOLDER"], temp_file_name))
        image.close()

        # Rename temp file
        os.rename(os.path.join(current_app.config["UPLOAD_FOLDER"], temp_file_name),
                  os.path.join(current_app.config["UPLOAD_FOLDER"], str(new_file.id)))

        current_app.logger.info("File saved as %s", new_file.id)
        user.profile_picture = new_file.id

    if "name" in request.form:
        user.name = request.form["name"]

    db.session.commit()

    return jsonify({"message": "Settings updated successfully"}), 200


@settings_blueprint.route("/settings/password", methods=["PUT"])
def settings_password():
    current_app.logger.info("Reading from settings")

    user = get_user(request)

    if user is None:
        return redirect("/login")

    if "password" not in request.form:
        return jsonify({"message": "No password provided"}), 400

    (pwhash, pwsalt) = hash_password(request.form["password"])
    user.password = pwhash
    user.password_salt = pwsalt

    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
