import os
from typing import Any

from flask import Flask, redirect
from flask_admin.menu import MenuLink
from flask_cors import CORS
from flask_admin import Admin, AdminIndexView, expose
from sqlalchemy.orm import Session
from models import *
from routes import *

app = Flask(__name__)
app.config.from_pyfile('config.py')

app.register_blueprint(login_blueprint)
app.register_blueprint(student_blueprint)
app.register_blueprint(teacher_blueprint)

CORS(app)


class AdminHomeView(AdminIndexView):
    def is_visible(self):
        # This view won't appear in the menu structure
        return False

    @expose("/")
    def index(self):
        return redirect("/admin/user")  # Redirect to the user view by default

    def is_accessible(self):
        user = get_user(request)
        return user is not None and user.type == UserType.ADMIN

    def inaccessible_callback(self, name, **kwargs):
        return redirect("/login")


admin = Admin(app, name='CSE-106 School Admin', template_mode='bootstrap4', index_view=AdminHomeView())


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if request.cookies.get("session") is None:
        return redirect("/login")

    username = verify_login_cookie(request.cookies.get("session"), app.config["COOKIE_SECRET"])
    if username is None:
        return redirect("/login")

    app.logger.info("Reading from %s", path)
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    elif path != "" and os.path.exists(app.static_folder + "/" + path + "/index.html"):
        return send_from_directory(app.static_folder, path + "/index.html")
    else:
        user = db.session.query(User).filter(User.username == username).first()

        if user is None:
            return redirect("/login")

        if user.type == UserType.STUDENT:
            return redirect("/student")
        elif user.type == UserType.TEACHER:
            return redirect("/teacher")
        elif user.type == UserType.ADMIN:
            return redirect("/admin")
        else:
            return redirect("/login")


@app.errorhandler(404)
def page_not_found(e):
    return redirect("/")


def prepare_db():
    global app
    db.init_app(app)

    with app.app_context():
        db.create_all()
        admin.add_view(UserView(User, session=Session(db.engine)))
        admin.add_link(MenuLink(name="Logout", category="", url="/logout"))


if __name__ == '__main__':
    prepare_db()
    app.run(debug=True, threaded=True, port=5000)
