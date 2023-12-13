from datetime import timedelta

from flask import Blueprint, send_from_directory, request, jsonify, current_app, redirect
from auth.password import *
from auth.utilities import get_user
from models import *

login_blueprint = Blueprint("login_blueprint", __name__, static_folder="../../frontend/dist", static_url_path="/")


@login_blueprint.route("/login", methods=["GET"])
def login_get():
    current_app.logger.info("Reading from login")
    return send_from_directory(login_blueprint.static_folder, "login/index.html")


@login_blueprint.route("/login", methods=["POST"])
def login_post():
    current_app.logger.info("Login attempt made")
    data = request.get_json()
    if data is None:
        return jsonify({"success": False, "message": "No data received"}), 400
    if "username" not in data or "password" not in data:
        return jsonify({"success": False, "message": "Missing email or password"}), 400

    user = sign_in(data["username"], data["password"])

    if user is None:
        return jsonify({"success": False, "message": "Invalid email or password"}), 401

    cookie = create_login_cookie(user.username, current_app.config["COOKIE_SECRET"])
    response = jsonify({"success": True, "message": "Login successful", "user": {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "type": user.type
    }})
    response.set_cookie("session", cookie, httponly=True, samesite="strict", secure=True, max_age=604800)

    return response, 200


@login_blueprint.route("/register", methods=["POST"])
def register_post():
    current_app.logger.info("Register attempt made")
    data = request.get_json()
    if data is None:
        return jsonify({"success": False, "message": "No data received"}), 400
    if "username" not in data or "password" not in data or "name" not in data:
        return jsonify({"success": False, "message": "Missing username, password, name, or type"}), 400

    if db.session.query(User).filter(User.username == data["username"]).count() > 0:
        return jsonify({"success": False, "message": "Username already exists"}), 400

    user = User(data["username"], data["name"], data["password"], UserType.USER)
    db.session.add(user)
    db.session.commit()

    cookie = create_login_cookie(user.username, current_app.config["COOKIE_SECRET"])
    response = jsonify({"success": True, "message": "Register successful", "user": {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "type": user.type
    }})
    response.set_cookie("session", cookie, httponly=True, samesite="strict", secure=True, max_age=604800)

    return response, 200


@login_blueprint.route("/logout", methods=["GET", "POST"])
def logout_post():
    current_app.logger.info("Logout attempt made")
    response = redirect("/login")
    response.set_cookie("session", "", httponly=True, samesite="strict", secure=True, max_age=0)

    return response


@login_blueprint.route("/me", methods=["GET"])
def me_get():
    current_app.logger.info("Me attempt made")
    user = get_user(request)

    if user is None:
        return jsonify({"success": False, "message": "Not logged in"}), 401

    del user.password
    del user.password_salt
    return jsonify({
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "type": user.type,
        "avatar": user.profile_picture
    })


def sign_in(username, password):
    generate_temp_data()  # Initialize the database with some temporary data

    user = db.session.query(User).filter(User.username == username).first()

    if user is None:
        return None

    if not verify_password(password, user.password, user.password_salt):
        return None

    del user.password
    del user.password_salt
    return user


def generate_temp_data():
    if db.session.query(User).count() > 0:
        return

    user = User("wle", "William Le", "wle", UserType.ADMIN)
    db.session.add(user)
    user = User("raguilar", "Ray Aguilar", "raguilar", UserType.ADMIN)
    db.session.add(user)
    user = User("eferguson", "Eric Ferguson", "eferguson", UserType.ADMIN)
    db.session.add(user)
    user = User("jmiranda", "Javier Miranda", "jmiranda", UserType.ADMIN)
    db.session.add(user)

    user = User("jsantos", "Jose Santos", "jsantos", UserType.USER)
    db.session.add(user)
    user = User("bbrown", "Betty Brown", "bbrown", UserType.USER)
    db.session.add(user)
    user = User("jstuart", "John Stuart", "jstuart", UserType.USER)
    db.session.add(user)
    user = User("lcheng", "Li Cheng", "lcheng", UserType.USER)
    db.session.add(user)
    user = User("nlittle", "Nancy Little", "nlittle", UserType.USER)
    db.session.add(user)
    user = User("mnorris", "Mindy Norris", "mnorris", UserType.USER)
    db.session.add(user)
    user = User("aranganath", "Aditya Ranganath", "aranganath", UserType.USER)
    db.session.add(user)
    user = User("ychen", "Yi Wen Chen", "ychen", UserType.USER)
    db.session.add(user)

    user = User("walmart", "Ammon Hepworth", "walmart", UserType.USER)
    db.session.add(user)
    user = User("rjenkins", "Ralph Jenkins", "rjenkins", UserType.USER)
    db.session.add(user)
    user = User("swalker", "Susan Walker", "swalker", UserType.USER)
    db.session.add(user)

    db.session.commit()
