// Открывает тему курса
function openTopic(url) {
    window.location.href = url;
}

// Добавляет обработчики кликов для тем курса
document.addEventListener("DOMContentLoaded", function () {
    const topics = document.querySelectorAll('.industrial-topic');
    topics.forEach(topic => {
        topic.addEventListener('click', function () {
            openTopic(this.dataset.url);
        });
    });
});

// Функция для загрузки материалов
function loadMaterials() {
    console.log("Загрузка материалов...");
}

// Функция для кликов по кнопкам материалов
document.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert("Материал временно недоступен!");
    });
});

// Функция для отображения заданий
function showTasks(topicId) {
    const sidebar = document.getElementById('tasksSidebar');
    const container = document.getElementById('tasksContainer');

    // Показываем заглушку загрузки
    container.innerHTML = '<div class="loading">Загрузка заданий...</div>';
    sidebar.classList.add('visible');

    fetch(`/industrial-course/get-tasks/${topicId}`)
        .then(response => response.json())
        .then(data => renderTasks(data))
        .catch(error => {
            console.error("Ошибка:", error);
            container.innerHTML = '<div class="error">Ошибка загрузки</div>';
        });
}

// Функция для скрытия панели заданий
function hideTasks() {
    document.getElementById('tasksSidebar').classList.remove('visible');
}

function renderTasks(data) {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';

    const taskTypes = {
        'class': 'Классная работа',
        'home': 'Домашнее задание',
        'extra': 'Дополнительное задание'
    };

    Object.entries(taskTypes).forEach(([type, title]) => {
        const tasks = data.tasks.filter(task => task.task_type === type);
        const section = document.createElement('div');
        section.className = 'task-type-section';

        section.innerHTML = `
            <div class="task-type-title">${title}</div>
            ${tasks.length ?
                tasks.map(task => `
                    <div class="task-item" onclick="window.location.href='/industrial-course/pygame${data.topic.id}/task/${task.id}'">
                        ${task.title}
                    </div>
                `).join('') :
                '<div class="no-tasks">Задания отсутствуют</div>'
            }
        `;

        container.appendChild(section);
    });
}

function toggleArrow(event, element) {
    event.stopPropagation();

    const additionalText = element.previousElementSibling;
    if (additionalText.classList.contains('additional-text')) {
        additionalText.textContent = element.classList.contains('arrow-down')
            ? "Развернуть"
            : "Свернуть";
    }

    // Остальной код функции остается без изменений
    const topicBox = element.closest('.topic-box');
    const containerItem = topicBox.closest('.topic-container-item');
    const expandableContent = containerItem.querySelector('.expandable-content');

    element.classList.toggle('arrow-down');
    topicBox.classList.toggle('expanded');
    expandableContent.classList.toggle('expanded');

    element.textContent = element.classList.contains('arrow-down') ? '▼' : '▲';
}