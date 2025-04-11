from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import hashlib
from datetime import datetime
import re
from industrial_cours.industrial_routes import industrial_bp
import logging

app = Flask(__name__)
app.secret_key = 'super_secret_key'

app.register_blueprint(industrial_bp, url_prefix="/industrial-course")

logging.basicConfig(
    filename='database_changes.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


def hash_password(password):  # хэшширует пароль
    return hashlib.sha256(password.encode()).hexdigest()


def init_db():  # создание базы данных user
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            birthdate TEXT,
            solutions_count INTEGER DEFAULT 3,
            last_login TEXT
        )
    ''')
    conn.commit()
    conn.close()


init_db()


def get_user_ip():  # получение ip
    if request.headers.getlist("X-Forwarded-For"):
        return request.headers.getlist("X-Forwarded-For")[0]
    return request.remote_addr


@app.route('/update_solutions_count', methods=['POST'])
def update_solutions_count():  # обновление количества доступных решений
    if 'email' not in session:
        return jsonify({'error': 'Требуется авторизация'}), 401

    new_count = request.json.get('count', 0)
    email = session["email"]
    ip = get_user_ip()
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT name, surname, birthdate FROM users WHERE email = ? ORDER BY time DESC LIMIT 1',
                       (email,))
        user_data = cursor.fetchone()

        if user_data:
            name, surname, birthdate = user_data

            cursor.execute('''
                INSERT INTO users (action, ip, time, name, surname, email, password, birthdate, solutions_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', ("count_update", ip, time, name, surname, email, '', birthdate, new_count))

            conn.commit()
            logging.info(f"[count_update] {email} изменение количество решений на {new_count} с IP {ip}")
            session["solutions_count"] = new_count
    finally:
        conn.close()

    return jsonify({'success': True})


@app.route('/validate_login', methods=['POST'])
def validate_login():  # функция входа
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    ip = get_user_ip()

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    if not email and not password:
        cursor.execute('SELECT * FROM users WHERE ip = ? ORDER BY time DESC LIMIT 1', (ip,))
        existing_user = cursor.fetchone()

        if existing_user:
            session["user"] = f"{existing_user[4]} {existing_user[5]}"
            session["solutions_count"] = existing_user[9]
            session["email"] = existing_user[6]

            time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute('''
                INSERT INTO users (action, ip, time, name, surname, email, password, birthdate, solutions_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', ("login_by_ip", ip, time, existing_user[4], existing_user[5],
                  existing_user[6], '', existing_user[8], existing_user[9]))
            conn.commit()
            logging.info(f"[login_by_ip] Вход по IP: {ip}, email: {existing_user[6]}")
            conn.close()

            return jsonify({"success": True, "message": "Вход по IP выполнен успешно"})
        else:
            conn.close()
            return jsonify({"success": False, "message": "Вход по IP невозможен. Введите email и пароль"})

    cursor.execute('SELECT * FROM users WHERE email = ? AND password = ? ORDER BY time DESC LIMIT 1',
                   (email, hash_password(password)))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"success": False, "message": "Неверный email или пароль"})

    current_count = user[9]

    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        INSERT INTO users (action, ip, time, name, surname, email, password, birthdate, solutions_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("login", ip, time, user[4], user[5], email, hash_password(password), user[8], current_count))

    conn.commit()
    logging.info(f"[login] Успешный вход: {email}, IP: {ip}")
    conn.close()

    session["user"] = f"{user[4]} {user[5]}"
    session["solutions_count"] = current_count
    session["email"] = email

    return jsonify({"success": True, "message": "Вход выполнен успешно"})


def validate_password(password):  # проверка пароля на правильность
    if len(password) < 8:
        return False, "Пароль должен содержать минимум 8 символов."

    if not re.search(r'[A-Z]', password):
        return False, "Пароль должен содержать хотя бы одну букву в верхнем регистре."

    if not re.search(r'[a-z]', password):
        return False, "Пароль должен содержать хотя бы одну букву в нижнем регистре."

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Пароль должен содержать хотя бы один специальный символ (!, @, #, и т.д.)."

    return True, "Пароль соответствует требованиям."


@app.route('/validate_register', methods=['POST'])
def validate_register():  # функция регистрации
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

    is_valid, message = validate_password(password)
    if not is_valid:
        return jsonify({"success": False, "message": message})

    try:
        day, month, year = map(int, birthdate.split('.'))
        if not (1 <= day <= 31 and 1 <= month <= 12 and 1925 <= year <= 2011):
            return jsonify({"success": False, "message": "Некорректная дата рождения"})
    except ValueError:
        return jsonify({"success": False, "message": "Некорректный формат даты"})

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        ip = get_user_ip()
        time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute('''
            INSERT INTO users (action, ip, time, name, surname, email, password, birthdate, solutions_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ("register", ip, time, name, surname, email, hash_password(password), birthdate, 3))
        conn.commit()
        logging.info(f"[register] Зарегистрирован: {email}, IP: {ip}")

        session["user"] = f"{name} {surname}"
        session["solutions_count"] = 3
        session["email"] = email

    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Пользователь с таким email уже зарегистрирован"})
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Регистрация прошла успешно"})


@app.route('/validate_account_data', methods=['POST'])
def validate_account_data():  # проверка данных аккаунта для смены пароля
    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    email = data.get('email')
    birthdate = data.get('birthdate')

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE name = ? AND surname = ? AND email = ? AND birthdate = ?',
                   (name, surname, email, birthdate))
    user = cursor.fetchone()

    conn.close()

    if user:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Введённые вами данные аккаунта различны с данными регистрации"})


@app.route('/change_password', methods=['POST'])
def change_password():  # функция смены пароля
    data = request.json
    new_password = data.get('newPassword')
    email = data.get('email')

    if not new_password or not email:
        return jsonify({"success": False, "message": "Недостаточно данных для смены пароля"})

    is_valid, message = validate_password(new_password)
    if not is_valid:
        return jsonify({"success": False, "message": message})

    hashed_password = hash_password(new_password)

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('UPDATE users SET password = ? WHERE email = ?', (hashed_password, email))
    conn.commit()
    logging.info(f"[password_change] Пароль изменён для: {email}")

    cursor.execute('SELECT name, surname, solutions_count FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if user:
        name, surname, solutions_count = user
        session["user"] = f"{name} {surname}"
        session["solutions_count"] = solutions_count

    conn.close()

    return jsonify({"success": True, "message": "Пароль успешно изменён"})


@app.route('/')
def home():  # главная страница
    return render_template('index.html', user=session.get("user"), solutions_count=session.get("solutions_count", 0))


@app.route('/python-course')
def python_course():  # 1-ый курс
    return render_template('python_course.html', user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0))


@app.route('/logout')
def logout():  # функция выхода из аккаунта
    session.clear()
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
