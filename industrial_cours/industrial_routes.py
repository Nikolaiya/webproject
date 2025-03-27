from flask import Blueprint, render_template, session

industrial_bp = Blueprint('industrial', __name__,
                        template_folder='templates',
                        static_folder='static2')  # Указываем кастомную папку static2


@industrial_bp.route('/')
def industrial_course():
    # Жестко задаем темы курса, если нет базы данных
    topics = [("PyGame7",)]  # Список с одной темой

    return render_template('industrial_course.html',
                           user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0),
                           topics=topics)


@industrial_bp.route('/PyGame7')
def pygame7():
    return render_template('PyGame7.html',
                           user=session.get("user"),
                           solutions_count=session.get("solutions_count", 0))