from flask import Blueprint, current_app, send_from_directory, request, redirect, jsonify
from sqlalchemy import func

from auth.utilities import get_user
from models import *

student_blueprint = Blueprint("student_blueprint", __name__, static_folder="../../frontend/dist", static_url_path="/")


@student_blueprint.route("/student", methods=["GET"])
def student_get():
    current_app.logger.info("Reading from student")

    user = get_user(request)
    if user is None:
        return redirect("/login")
    if user.type == UserType.TEACHER:
        return redirect("/teacher")
    if user.type == UserType.ADMIN:
        return redirect("/admin")

    return send_from_directory(student_blueprint.static_folder, "student/index.html")


@student_blueprint.route("/student/courses", methods=["GET"])
def student_courses_get():
    current_app.logger.info("Getting courses for student")

    user = get_user(request)

    output = []
    courses = db.session.query(Course).join(Enrollment).filter(Enrollment.student == user.id).all()

    for course in courses:
        teacher_name = db.session.query(User.name).filter(User.id == course.teacher).scalar()
        enrollment = db.session.query(func.count(Enrollment.student)).filter(Enrollment.course == course.id).scalar()
        grade = db.session.query(Enrollment.grade).filter(Enrollment.student == user.id,
                                                          Enrollment.course == course.id).scalar()
        output.append({
            "id": course.id,
            "name": course.name,
            "teacher": course.teacher,
            "teacher_name": teacher_name,
            "time": course.time,
            "max_enrollment": course.max_enrollment,
            "enrollment": enrollment,
            "grade": grade
        })

    return jsonify(output), 200


@student_blueprint.route("/student/register", methods=["GET"])
def student_register_get():
    current_app.logger.info("Getting registrations for student")

    user = get_user(request)

    output = []
    courses = db.session.query(Course).all()

    for course in courses:
        teacher_name = db.session.query(User.name).filter(User.id == course.teacher).scalar()
        enrollment = db.session.query(func.count(Enrollment.student)).filter(Enrollment.course == course.id).scalar()
        is_enrolled = db.session.query(Enrollment).filter(Enrollment.student == user.id,
                                                          Enrollment.course == course.id).scalar() is not None
        output.append({
            "id": course.id,
            "name": course.name,
            "teacher": course.teacher,
            "teacher_name": teacher_name,
            "time": course.time,
            "max_enrollment": course.max_enrollment,
            "enrollment": enrollment,
            "is_enrolled": is_enrolled
        })

    return jsonify(output), 200


@student_blueprint.route("/student/register", methods=["POST"])
def student_register_post():
    current_app.logger.info("Setting registrations for student")

    # read json
    data = request.get_json()
    if data is None or "course_id" not in data:
        return jsonify({"success": False, "message": "No data received"}), 400

    course_id = data["course_id"]

    user = get_user(request)

    course = db.session.query(Course).filter(Course.id == course_id).first()
    if course is None:
        return jsonify({"success": False, "message": "Invalid course ID"}), 400
    enrollment = db.session.query(Enrollment).filter(Enrollment.student == user.id,
                                                     Enrollment.course == course.id).first()
    if enrollment is None:  # Not enrolled
        current_enrollments = db.session.query(func.count(Enrollment.student)).filter(
            Enrollment.course == course.id).scalar()
        if current_enrollments >= course.max_enrollment:
            return jsonify({"success": False, "message": "Course is full"}), 400
        else:
            enrollment = Enrollment(user.id, course.id, 100)
            db.session.add(enrollment)
            db.session.commit()
    else:
        db.session.delete(enrollment)
        db.session.commit()

    return jsonify({"success": True, "message": "Registration/unregistration successful"}), 200
