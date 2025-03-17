from flask import Flask, render_template, request, redirect, url_for, session
import sqlite3
import hashlib

app = Flask(__name__)
app.secret_key = 'super_secret_key'

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    return render_template('index.html', user=session.get("user"))

@app.route('/python-course')
def python_course():
    return render_template('python_course.html')

@app.route('/industrial-course')
def industrial_course():
    return render_template('industrial_course.html')

@app.route('/register', methods=['POST'])
def register():
    name = request.form['name']
    surname = request.form['surname']
    email = request.form['email']
    password = hash_password(request.form['password'])

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)',
                       (name, surname, email, password))
        conn.commit()
        session["user"] = f"{name} {surname}"
    except sqlite3.IntegrityError:
        return "Пользователь с таким email уже зарегистрирован!"
    finally:
        conn.close()

    return redirect(url_for('home'))

@app.route('/logout')
def logout():
    session.pop("user", None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
