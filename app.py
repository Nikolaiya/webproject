from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import hashlib
from datetime import datetime
import re

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
            ip TEXT NOT NULL,
            time TEXT NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            solutions_count INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()


init_db()


def get_user_ip():
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        ip = request.remote_addr
    return ip


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

    if user:
        # Получаем IP и текущее время
        ip = get_user_ip()
        time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Обновляем IP и время последнего входа
        cursor.execute('UPDATE users SET ip = ?, time = ? WHERE id = ?', (ip, time, user[0]))
        conn.commit()
        # Сохраняем имя, фамилию и solutions_count в сессии
        session["user"] = f"{user[3]} {user[4]}"  # name и surname
        session["solutions_count"] = user[7]  # solutions_count
        conn.close()
        return jsonify({"success": True, "message": "Вход выполнен успешно"})
    else:
        conn.close()
        return jsonify({"success": False, "message": "Неверный email или пароль"})

def validate_password(password):
    # Минимум 8 символов
    if len(password) < 8:
        return False, "Пароль должен содержать минимум 8 символов."

    # Хотя бы одна буква в верхнем регистре
    if not re.search(r'[A-Z]', password):
        return False, "Пароль должен содержать хотя бы одну букву в верхнем регистре."

    # Хотя бы одна буква в нижнем регистре
    if not re.search(r'[a-z]', password):
        return False, "Пароль должен содержать хотя бы одну букву в нижнем регистре."

    # Хотя бы один специальный символ
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Пароль должен содержать хотя бы один специальный символ (!, @, #, и т.д.)."

    # Если все проверки пройдены
    return True, "Пароль соответствует требованиям."


@app.route('/validate_register', methods=['POST'])
def validate_register():
    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    email = data.get('email')
    password = data.get('password')
    repeat_password = data.get('repeat_password')
    birthdate = data.get('birthdate')

    # Проверка на заполненность всех полей
    if not name or not surname or not email or not password or not repeat_password or not birthdate:
        return jsonify({"success": False, "message": "Все поля должны быть заполнены"})

    # Проверка на совпадение паролей (в приоритете)
    if password != repeat_password:
        return jsonify({"success": False, "message": "Пароли не совпадают"})

    # Проверка сложности пароля
    is_valid, message = validate_password(password)
    if not is_valid:
        return jsonify({"success": False, "message": message})

    # Проверка даты рождения
    try:
        day, month, year = map(int, birthdate.split('.'))
        if not (1 <= day <= 31 and 1 <= month <= 12 and 1925 <= year <= 2011):
            return jsonify({"success": False, "message": "Некорректная дата рождения"})
    except ValueError:
        return jsonify({"success": False, "message": "Некорректный формат даты"})

    # Регистрация пользователя
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        # Получаем IP и текущее время
        ip = get_user_ip()
        time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Устанавливаем solutions_count = 3 при регистрации
        cursor.execute('''
            INSERT INTO users (ip, time, name, surname, email, password, solutions_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (ip, time, name, surname, email, hash_password(password), 3))
        conn.commit()

        # Сохраняем имя, фамилию и solutions_count в сессии
        session["user"] = f"{name} {surname}"
        session["solutions_count"] = 3  # Устанавливаем solutions_count в сессии
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Пользователь с таким email уже зарегистрирован"})
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Регистрация прошла успешно"})


@app.route('/')
def home():
    return render_template('index.html', user=session.get("user"), solutions_count=session.get("solutions_count", 0))


@app.route('/python-course')
def python_course():
    return render_template('python_course.html', user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0))


@app.route('/industrial-course')
def industrial_course():
    return render_template('industrial_course.html', user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0))


@app.route('/logout')
def logout():
    if "user" in session:
        # Получаем email пользователя из сессии
        email = session["user"].split()[1]  # Предполагаем, что email находится после фамилии
        solutions_count = session.get("solutions_count", 0)  # Получаем текущее значение из сессии

        # Обновляем значение solutions_count в базе данных
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET solutions_count = ? WHERE email = ?', (solutions_count, email))
        conn.commit()
        conn.close()

    # Очищаем сессию
    session.pop("user", None)
    session.pop("solutions_count", None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
