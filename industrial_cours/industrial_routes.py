from flask import Blueprint, render_template, session
import sqlite3

industrial_bp = Blueprint('industrial', __name__,
                        static_folder='static',
                        static_url_path='/industrial-static',
                        template_folder='templates')


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


# Добавляем маршруты для PyGame 1-5
@industrial_bp.route('/pygame1')
def pygame1():
    return render_template('pygame1.html',
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