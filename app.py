from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import sqlite3
import hashlib
from datetime import datetime
import re
from industrial_cours.industrial_routes import industrial_bp  # Подключаем Blueprint

app = Flask(__name__)
app.secret_key = 'super_secret_key'

# Убедитесь, что Blueprint регистрируется правильно
app.register_blueprint(industrial_bp, url_prefix="/industrial-course")

def hash_password(password):  # Хэширует пароль
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            ip TEXT NOT NULL,
            time TEXT NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            birthdate TEXT,
            solutions_count INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

init_db()


def get_user_ip(): # Получает IP-адрес
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0]
    else:
        ip = request.remote_addr
    return ip


@app.route('/validate_login', methods=['POST'])
def validate_login(): # Обрабатывает запрос на вход пользователя
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    ip = get_user_ip()

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE ip = ?', (ip,))
    existing_user = cursor.fetchone()

    if existing_user:
        name, surname, email, birthdate, solutions_count = existing_user[4], existing_user[5], existing_user[6], existing_user[8], existing_user[9]
    else:
        if not email or not password:
            conn.close()
            return jsonify({"success": False, "message": "Все поля должны быть заполнены"})

        cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, hash_password(password)))
        user = cursor.fetchone()

        if not user:
            conn.close()
            return jsonify({"success": False, "message": "Неверный email или пароль"})

        name, surname, birthdate, solutions_count = user[4], user[5], user[8], user[9]

    ip = get_user_ip()
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute('''
        INSERT INTO users (action, ip, time, name, surname, email, password, birthdate, solutions_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("login", ip, time, name, surname, email, hash_password(password if password else ""), birthdate, solutions_count))

    conn.commit()
    conn.close()

    session["user"] = f"{name} {surname}"
    session["solutions_count"] = solutions_count

    return jsonify({"success": True, "message": "Вход выполнен успешно"})


def validate_password(password): # Проверяет, соответствует ли пароль требованиям
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
def validate_register():
    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    email = data.get('email')
    password = data.get('password')
    repeat_password = data.get('repeat_password')
    birthdate = data.get('birthdate')  # Получаем дату рождения

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

        session["user"] = f"{name} {surname}"
        session["solutions_count"] = 3
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Пользователь с таким email уже зарегистрирован"})
    finally:
        conn.close()

    return jsonify({"success": True, "message": "Регистрация прошла успешно"})

@app.route('/validate_account_data', methods=['POST'])
def validate_account_data():
    data = request.json
    name = data.get('name')
    surname = data.get('surname')
    email = data.get('email')
    birthdate = data.get('birthdate')  # Получаем дату рождения

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Проверяем, совпадают ли данные с базой данных
    cursor.execute('SELECT * FROM users WHERE name = ? AND surname = ? AND email = ? AND birthdate = ?',
                   (name, surname, email, birthdate))
    user = cursor.fetchone()

    conn.close()

    if user:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Введённые вами данные аккаунта различны с данными регистрации"})

@app.route('/change_password', methods=['POST'])
def change_password():
    data = request.json
    new_password = data.get('newPassword')
    email = data.get('email')  # Получаем email из запроса

    if not new_password or not email:
        return jsonify({"success": False, "message": "Недостаточно данных для смены пароля"})

    # Проверяем сложность пароля
    is_valid, message = validate_password(new_password)
    if not is_valid:
        return jsonify({"success": False, "message": message})

    # Хэшируем новый пароль
    hashed_password = hash_password(new_password)

    # Обновляем пароль в базе данных
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    cursor.execute('UPDATE users SET password = ? WHERE email = ?', (hashed_password, email))
    conn.commit()

    # Получаем данные пользователя для создания сессии
    cursor.execute('SELECT name, surname, solutions_count FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if user:
        name, surname, solutions_count = user
        session["user"] = f"{name} {surname}"  # Создаем сессию
        session["solutions_count"] = solutions_count

    conn.close()

    return jsonify({"success": True, "message": "Пароль успешно изменён"})


@app.route('/')
def home(): # Главная страница
    return render_template('index.html', user=session.get("user"), solutions_count=session.get("solutions_count", 0))


@app.route('/python-course')
def python_course(): # Курс 1
    return render_template('python_course.html', user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0))



@app.route('/logout')
def logout(): # Обрабатывает выход пользователя из системы
    if "user" in session:
        email = session["user"].split()[1]
        solutions_count = session.get("solutions_count", 0)

        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET solutions_count = ? WHERE email = ?', (solutions_count, email))
        conn.commit()
        conn.close()

    session.pop("user", None)
    session.pop("solutions_count", None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
