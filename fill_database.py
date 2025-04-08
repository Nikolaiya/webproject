import sqlite3
from datetime import datetime


def fill_database():
    # Подключаемся к базе данных
    conn = sqlite3.connect('materials.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_solutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        solution_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
    ''')

    # Темы и их задания
    topics_data = [
        {
            "title": "PyGame 1",
            "tasks": [
                {"title": "Крест", "type": "class", "difficulty": 2},
                {"title": "Прямоугольник", "type": "class", "difficulty": 1},
                {"title": "Сфера", "type": "home", "difficulty": 3},
                {"title": "Ромбики", "type": "home", "difficulty": 2},
                {"title": "Кирпичи", "type": "home", "difficulty": 3},
                {"title": "Куб", "type": "extra", "difficulty": 4}
            ]
        },
        {
            "title": "PyGame 2",
            "tasks": [
                {"title": "Жёлтый круг", "type": "class", "difficulty": 1},
                {"title": "Я слежу за тобой!", "type": "home", "difficulty": 3},
                {"title": "К щелчку", "type": "home", "difficulty": 2}
            ]
        },
        {
            "title": "PyGame 3",
            "tasks": [
                {"title": "Инициализация игры", "type": "class", "difficulty": 1},
                {"title": "Координаты клетки", "type": "class", "difficulty": 2},
                {"title": "Чёрное в белое и наоборот", "type": "class", "difficulty": 3}
            ]
        },
        {
            "title": "PyGame 4",
            "tasks": [
                {"title": "Папа сапёра", "type": "home", "difficulty": 4},
                {"title": "Полилинии", "type": "home", "difficulty": 3}
            ]
        },
        {
            "title": "PyGame 5",
            "tasks": [
                {"title": "Game over", "type": "extra", "difficulty": 5}
            ]
        }
    ]

    # Добавляем темы и задания в базу данных
    for topic in topics_data:
        # Вставляем тему
        cursor.execute(
            "INSERT INTO topics (course_id, title, created_at) VALUES (?, ?, ?)",
            (2, topic["title"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        )
        topic_id = cursor.lastrowid

        # Вставляем задания для темы
        for task in topic["tasks"]:
            cursor.execute(
                """INSERT INTO tasks 
                (topic_id, title, task_type, difficulty) 
                VALUES (?, ?, ?, ?)""",
                (topic_id, task["title"], task["type"], task["difficulty"])
            )

    # Сохраняем изменения и закрываем соединение
    conn.commit()
    conn.close()
    print("База данных успешно заполнена темами и заданиями!")


if __name__ == '__main__':
    fill_database()
