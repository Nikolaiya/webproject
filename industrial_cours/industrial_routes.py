import datetime

from flask import Blueprint, render_template, session, jsonify, request
import sqlite3

industrial_bp = Blueprint('industrial', __name__,
                        static_folder='static2',
                        static_url_path='/industrial-static',
                        template_folder='templates')


def init_db():
    conn = sqlite3.connect('materials.db')
    cursor = conn.cursor()

    # Удаляем старую таблицу (если существует)
    cursor.execute('DROP TABLE IF EXISTS user_solutions')

    # Создаем новую таблицу без внешнего ключа
    cursor.execute('''
    CREATE TABLE user_solutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER,  -- Просто храним ID, без связи с другой БД
        username TEXT,    -- Добавляем поле для имени пользователя
        solution_text TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    conn.commit()
    conn.close()


init_db()

def get_db_connection():
    conn = sqlite3.connect('materials.db')
    conn.row_factory = sqlite3.Row
    return conn


@industrial_bp.route('/')
def industrial_course():
    conn = get_db_connection()

    # Получаем все темы курса
    topics = conn.execute('SELECT * FROM topics WHERE course_id = 2').fetchall()

    # Для каждой темы получаем только задания (без материалов)
    topics_data = []
    for topic in topics:
        tasks = conn.execute('''
            SELECT * FROM tasks 
            WHERE topic_id = ?
            ORDER BY CASE task_type
                WHEN 'class' THEN 1
                WHEN 'home' THEN 2
                WHEN 'extra' THEN 3
            END
        ''', (topic['id'],)).fetchall()

        topics_data.append({
            'topic': dict(topic),
            'tasks': [dict(t) for t in tasks]
        })

    conn.close()

    return render_template('industrial_course.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0),
                         topics_data=topics_data)


@industrial_bp.route('/get-tasks/<int:topic_id>')
def get_tasks(topic_id):
    conn = get_db_connection()
    try:
        tasks = conn.execute('''
            SELECT id, title, task_type, topic_id 
            FROM tasks 
            WHERE topic_id = ?
            ORDER BY CASE task_type
                WHEN 'class' THEN 1
                WHEN 'home' THEN 2
                WHEN 'extra' THEN 3
            END
        ''', (topic_id,)).fetchall()

        if not tasks:
            return jsonify({'error': 'Задания не найдены', 'tasks': []}), 404

        return jsonify({
            'tasks': [dict(task) for task in tasks]
        })
    except Exception as e:
        return jsonify({'error': str(e), 'tasks': []}), 500
    finally:
        conn.close()


@industrial_bp.route('/submit-solution/<int:task_id>', methods=['POST'])
def submit_solution(task_id):
    solution_text = request.form.get('solution_text')
    if not solution_text:
        return jsonify({'error': 'Решение не может быть пустым'}), 400

    conn = get_db_connection()
    try:
        # Получаем данные пользователя из сессии
        user_id = session.get('user_id')
        username = session.get('user')  # Или другой ключ, где хранится имя

        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO user_solutions 
               (task_id, user_id, username, solution_text, created_at) 
               VALUES (?, ?, ?, ?, ?)""",
            (task_id, user_id, username, solution_text,
             datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@industrial_bp.route('/get-solutions/<int:task_id>')
def get_solutions(task_id):
    conn = get_db_connection()
    try:
        solutions = conn.execute('''
            SELECT id, solution_text, created_at, 
                   COALESCE(username, 'Аноним') as username 
            FROM user_solutions
            WHERE task_id = ?
            ORDER BY created_at DESC
        ''', (task_id,)).fetchall()

        return jsonify({
            'solutions': [dict(sol) for sol in solutions]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@industrial_bp.route('/update-solutions-count', methods=['POST'])
def update_solutions_count():
    if 'user_id' not in session:
        return jsonify({'error': 'Требуется авторизация'}), 401

    new_count = request.json.get('count', 0)

    if new_count < 0:
        new_count = 0

    session['solutions_count'] = new_count

    # Если нужно сохранять в БД, добавьте соответствующий код здесь

    return jsonify({'success': True})


# Добавляем маршруты для PyGame 1-5
@industrial_bp.route('/pygame1')
def pygame1():
    return render_template('pygame1.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0))

@industrial_bp.route('/pygame1/task/1')
def pygame1_1_task():
    return render_template('pygame1_task_1.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0))

@industrial_bp.route('/pygame2')
def pygame2():
    return render_template('pygame2.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0))

@industrial_bp.route('/pygame3')
def pygame3():
    return render_template('pygame3.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0))

@industrial_bp.route('/pygame4')
def pygame4():
    return render_template('pygame4.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0))

@industrial_bp.route('/pygame5')
def pygame5():
    return render_template('pygame5.html',
                         user=session.get("user"),
                         solutions_count=session.get("solutions_count", 0))