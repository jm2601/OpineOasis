from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
#db = SQLAlchemy(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'



@app.route('/')
def home():
    return "working"


if __name__ == "__main__":
    app.run(debug=True)