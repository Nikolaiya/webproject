from flask import Flask, render_template, request, redirect, url_for, session, jsonify
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

@app.route('/validate_login', methods=['POST'])
def validate_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Все поля должны быть заполнены"})

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, hash_password(password)))
    user = cursor.fetchone()
    conn.close()

    if user:
        session["user"] = f"{user[1]} {user[2]}"
        return jsonify({"success": True, "message": "Вход выполнен успешно"})
    else:
        return jsonify({"success": False, "message": "Неверный email или пароль"})

@app.route('/validate_register', methods=['POST'])
def validate_register():
    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    email = data.get('email')
    password = data.get('password')
    repeat_password = data.get('repeat_password')
    birthdate = data.get('birthdate')

    if not name or not surname or not email or not password or not repeat_password or not birthdate:
        return jsonify({"success": False, "message": "Все поля должны быть заполнены"})

    if password != repeat_password:
        return jsonify({"success": False, "message": "Пароли не совпадают"})

    try:
        day, month, year = map(int, birthdate.split('.'))
        if not (1 <= day <= 31 and 1 <= month <= 12 and 1925 <= year <= 2011):
            return jsonify({"success": False, "message": "Некорректная дата рождения"})
    except ValueError:
        return jsonify({"success": False, "message": "Некорректный формат даты"})

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)',
                       (name, surname, email, hash_password(password)))
        conn.commit()
        session["user"] = f"{name} {surname}"
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Пользователь с таким email уже зарегистрирован"})
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Регистрация прошла успешно"})


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