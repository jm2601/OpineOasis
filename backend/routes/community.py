import mimetypes
import os

from flask import Blueprint, jsonify, send_file, send_from_directory
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


@community_blueprint.route("/api/community/<int:community_id>", methods=["GET"])
def community_get_api(community_id):
    posts = db.session.query(Post, User).filter(Post.community == community_id).all()

    return jsonify(posts), 200
