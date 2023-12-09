from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    date = db.Column(db.String(80), nullable=False)
    upvotes = db.Column(db.Integer, nullable = False)
    text = db.Column(db.String(300), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),  nullable = False)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(80), nullable=False)
    upvotes = db.Column(db.Integer, nullable = False)
    text = db.Column(db.String(300), nullable = False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'),  nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'),  nullable = False)

@app.route('/')
def home():
    return "working"


if __name__ == "__main__":
    app.run(debug=True)