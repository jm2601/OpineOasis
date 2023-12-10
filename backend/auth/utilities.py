from flask import current_app

from auth.password import verify_login_cookie
from models import *


def get_user(request):
    username = verify_login_cookie(request.cookies.get("session"), current_app.config["COOKIE_SECRET"])
    if username is None:
        return None
    user = db.session.query(User).filter(User.username == username).first()
    return user
