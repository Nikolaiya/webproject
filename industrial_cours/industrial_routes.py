from flask import Blueprint, render_template, session
import sqlite3

industrial_bp = Blueprint('industrial', __name__, template_folder='templates')

@industrial_bp.route('/')
def industrial_course():
    conn = sqlite3.connect('materials.db')
    cursor = conn.cursor()
    cursor.execute('SELECT title FROM topics WHERE course_id = 2')
    topics = cursor.fetchall()
    conn.close()

    return render_template('industrial_course.html',
                           user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0),
                           topics=topics)

@industrial_bp.route('/PyGame7')
def telegram_bot():
    return render_template('PyGame7.html',
                           user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0))
