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
        "type": user.type
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
    user = User("dstanford", "Derek Stanford", "dstanford", UserType.ADMIN)
    db.session.add(user)
    user = User("dbates", "David Bates", "dbates", UserType.ADMIN)
    db.session.add(user)
    user = User("ktorresanaya", "Kevin Torres-Anaya", "ktorresanaya", UserType.ADMIN)
    db.session.add(user)

    user = User("jsantos", "Jose Santos", "jsantos", UserType.STUDENT)
    db.session.add(user)
    user = User("bbrown", "Betty Brown", "bbrown", UserType.STUDENT)
    db.session.add(user)
    user = User("jstuart", "John Stuart", "jstuart", UserType.STUDENT)
    db.session.add(user)
    user = User("lcheng", "Li Cheng", "lcheng", UserType.STUDENT)
    db.session.add(user)
    user = User("nlittle", "Nancy Little", "nlittle", UserType.STUDENT)
    db.session.add(user)
    user = User("mnorris", "Mindy Norris", "mnorris", UserType.STUDENT)
    db.session.add(user)
    user = User("aranganath", "Aditya Ranganath", "aranganath", UserType.STUDENT)
    db.session.add(user)
    user = User("ychen", "Yi Wen Chen", "ychen", UserType.STUDENT)
    db.session.add(user)

    user = User("walmart", "Ammon Hepworth", "walmart", UserType.TEACHER)
    db.session.add(user)
    user = User("rjenkins", "Ralph Jenkins", "rjenkins", UserType.TEACHER)
    db.session.add(user)
    user = User("swalker", "Susan Walker", "swalker", UserType.TEACHER)
    db.session.add(user)

    course = Course("Math 101", db.session.query(User).filter(User.username == "rjenkins").first().id, "MWF 10:00-10:50 AM", 8)
    db.session.add(course)
    course = Course("Physics 121", db.session.query(User).filter(User.username == "swalker").first().id, "TR 11:00-11:50 AM", 10)
    db.session.add(course)
    course = Course("CS 106", db.session.query(User).filter(User.username == "walmart").first().id, "MWF 2:00-2:50 PM", 10)
    db.session.add(course)
    course = Course("CS 162", db.session.query(User).filter(User.username == "walmart").first().id, "TR 3:00-3:50 PM", 4)
    db.session.add(course)

    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "jsantos").first().id,
        db.session.query(Course).filter(Course.name == "Math 101").first().id,
        92)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "bbrown").first().id,
        db.session.query(Course).filter(Course.name == "Math 101").first().id,
        65)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "jstuart").first().id,
        db.session.query(Course).filter(Course.name == "Math 101").first().id,
        86)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "lcheng").first().id,
        db.session.query(Course).filter(Course.name == "Math 101").first().id,
        77)
    db.session.add(enrollment)

    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "nlittle").first().id,
        db.session.query(Course).filter(Course.name == "Physics 121").first().id,
        53)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "lcheng").first().id,
        db.session.query(Course).filter(Course.name == "Physics 121").first().id,
        85)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "mnorris").first().id,
        db.session.query(Course).filter(Course.name == "Physics 121").first().id,
        94)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "jstuart").first().id,
        db.session.query(Course).filter(Course.name == "Physics 121").first().id,
        91)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "bbrown").first().id,
        db.session.query(Course).filter(Course.name == "Physics 121").first().id,
        88)
    db.session.add(enrollment)

    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "aranganath").first().id,
        db.session.query(Course).filter(Course.name == "CS 106").first().id,
        93)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "ychen").first().id,
        db.session.query(Course).filter(Course.name == "CS 106").first().id,
        85)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "nlittle").first().id,
        db.session.query(Course).filter(Course.name == "CS 106").first().id,
        57)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "mnorris").first().id,
        db.session.query(Course).filter(Course.name == "CS 106").first().id,
        68)
    db.session.add(enrollment)

    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "aranganath").first().id,
        db.session.query(Course).filter(Course.name == "CS 162").first().id,
        99)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "nlittle").first().id,
        db.session.query(Course).filter(Course.name == "CS 162").first().id,
        87)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "ychen").first().id,
        db.session.query(Course).filter(Course.name == "CS 162").first().id,
        92)
    db.session.add(enrollment)
    enrollment = Enrollment(
        db.session.query(User).filter(User.username == "jstuart").first().id,
        db.session.query(Course).filter(Course.name == "CS 162").first().id,
        67)
    db.session.add(enrollment)

    db.session.commit()
