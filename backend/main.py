from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from flask_wtf.csrf import CSRFProtect
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_bcrypt import Bcrypt

app = Flask(__name__)
bcrypt = Bcrypt(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'secret'
db = SQLAlchemy(app)

Login_manager = LoginManager()
Login_manager.init_app(app)
Login_manager.login_view = "login"


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



class Register_Form(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(
        min=2, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(
        min=2, max=20)], render_kw={"placeholder": "Password"})
    
    submit = SubmitField("Register")
    def validate_username(self, username):
        existing_user_username = User.query.filter_by(username=username.data).first()
        if existing_user_username:
            raise ValidationError('That username already exists.')


class Login_Form(FlaskForm):
    username = StringField(validators=[InputRequired(), Length(
        min=2, max=20)], render_kw={"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(
        min=2, max=20)], render_kw={"placeholder": "Password"})
    
    submit = SubmitField("login")


@Login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def setup():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET','POST'])
def login():
    form = Login_Form()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('home'))

    return render_template('login.html', form = form)


@app.route('/register', methods=['GET','POST'])
def register():
    form = Register_Form()
    if form.validate_on_submit():
        hash = bcrypt.generate_password_hash(form.password.data)
        user = User(username=form.username.data, password=hash)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))

    return render_template('register.html', form = form)

@app.route('/home')
@login_required
def home():
    return render_template('home.html')


@app.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == "__main__":
    app.run(debug=True)