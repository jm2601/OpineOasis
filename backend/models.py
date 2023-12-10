from dataclasses import dataclass
from enum import IntEnum, auto

from flask import redirect, request, current_app
from flask_admin.contrib.sqla import ModelView
from sqlalchemy import Integer, String, BLOB, ForeignKey
from sqlalchemy.orm import DeclarativeBase, mapped_column
from typing_extensions import Any
from flask_sqlalchemy import SQLAlchemy
from auth.password import hash_password, verify_login_cookie


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class UserType(IntEnum):
    USER = auto()
    ADMIN = auto()


@dataclass
class User(Base):
    __tablename__ = "user"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    name = mapped_column(String(64), nullable=False)
    username = mapped_column(String(64), nullable=False)
    password = mapped_column(BLOB(64), nullable=False)
    password_salt = mapped_column(BLOB(16), nullable=False)
    type = mapped_column(Integer, nullable=False)
    profile_picture = mapped_column(ForeignKey("file.id"), nullable=True)

    def __init__(self, username, name, password, user_type: UserType, profile_picture=None, **kwargs: Any):
        super().__init__(**kwargs)
        self.name = name
        self.username = username
        self.type = int(user_type)
        self.profile_picture = profile_picture

        (pwhash, pwsalt) = hash_password(password)
        self.password = pwhash
        self.password_salt = pwsalt


def get_user(req):
    username = verify_login_cookie(req.cookies.get("session"), current_app.config["COOKIE_SECRET"])
    if username is None:
        return None
    user = db.session.query(User).filter(User.username == username).first()
    return user


class UserView(ModelView):
    column_display_pk = True
    column_hide_backrefs = False
    column_list = ["username", "name", "type"]
    form_columns = ["username", "name", "type"]

    def is_accessible(self):
        user = get_user(request)
        return user is not None and user.type == UserType.ADMIN

    def inaccessible_callback(self, name, **kwargs):
        return redirect("/login")


@dataclass
class Community(Base):
    __tablename__ = "community"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    name = mapped_column(String(64), nullable=False)
    owner = mapped_column(ForeignKey("user.id"), nullable=False)
    time_created = mapped_column(String(64), nullable=False)

    def __init__(self, name, owner, time_created, **kwargs: Any):
        super().__init__(**kwargs)
        self.name = name
        self.owner = owner
        self.time_created = time_created


@dataclass
class File(Base):
    __tablename__ = "file"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    name = mapped_column(String(64), nullable=False)
    owner = mapped_column(ForeignKey("user.id"), nullable=False)
    time_created = mapped_column(String(64), nullable=False)

    def __init__(self, name, owner, time_created, **kwargs: Any):
        super().__init__(**kwargs)
        self.name = name
        self.owner = owner
        self.time_created = time_created


@dataclass
class Post(Base):
    __tablename__ = "post"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    community = mapped_column(ForeignKey("community.id"), nullable=False)
    title = mapped_column(String(64), nullable=False)
    date = mapped_column(String(64), nullable=False)
    upvotes = mapped_column(Integer, nullable=False, default=0)
    downvotes = mapped_column(Integer, nullable=False, default=0)
    text = mapped_column(String(1024), nullable=False)
    image = mapped_column(ForeignKey("file.id"), nullable=True)
    user = mapped_column(ForeignKey("user.id"), nullable=False)

    def __init__(self, community, title, date, upvotes, text, image, user, **kwargs: Any):
        super().__init__(**kwargs)
        self.community = community
        self.title = title
        self.date = date
        self.upvotes = upvotes
        self.text = text
        self.image = image
        self.user = user


@dataclass
class Comment(Base):
    __tablename__ = "comment"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    post = mapped_column(ForeignKey("post.id"), nullable=False)
    user = mapped_column(ForeignKey("user.id"), nullable=False)
    text = mapped_column(String(1024), nullable=False)
    date = mapped_column(String(64), nullable=False)
    reply_to = mapped_column(ForeignKey("comment.id"), nullable=True)

    def __init__(self, post, user, text, date, upvotes, downvotes, reply_to, **kwargs: Any):
        super().__init__(**kwargs)
        self.post = post
        self.user = user
        self.text = text
        self.date = date
        self.upvotes = upvotes
        self.downvotes = downvotes
        self.reply_to = reply_to


@dataclass
class PostVote(Base):
    __tablename__ = "postvote"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    post = mapped_column(ForeignKey("post.id"), nullable=False)
    user = mapped_column(ForeignKey("user.id"), nullable=False)
    vote = mapped_column(Integer, nullable=False)

    def __init__(self, post, user, vote, **kwargs: Any):
        super().__init__(**kwargs)
        self.post = post
        self.user = user
        self.vote = vote


@dataclass
class CommentVote(Base):
    __tablename__ = "commentvote"
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    comment = mapped_column(ForeignKey("comment.id"), nullable=False)
    user = mapped_column(ForeignKey("user.id"), nullable=False)
    vote = mapped_column(Integer, nullable=False)

    def __init__(self, comment, user, vote, **kwargs: Any):
        super().__init__(**kwargs)
        self.comment = comment
        self.user = user
        self.vote = vote
