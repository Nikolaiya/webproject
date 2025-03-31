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
}

// Функция для кликов по кнопкам материалов
document.querySelectorAll('.material-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        alert("Материал временно недоступен!");
    });
});

let activeTopicButton = null;
let isSidebarVisible = false;

function showTasks(topicId) {
    const sidebar = document.getElementById('tasksSidebar');
    const container = document.getElementById('tasksContainer');

    // Находим активную кнопку
    activeTopicButton = document.querySelector(`.topic-box[onmouseenter*="${topicId}"]`);

    // Получаем позицию кнопки
    const buttonRect = activeTopicButton.getBoundingClientRect();

    // Добавляем класс активной кнопки
    activeTopicButton.classList.add('active-topic');
    isSidebarVisible = true;

    // Показываем sidebar
    sidebar.classList.add('visible');
    container.innerHTML = '<div class="loading">Загрузка заданий...</div>';

    // Загружаем задания
    fetch(`/industrial-course/get-tasks/${topicId}`)
        .then(response => response.json())
        .then(data => {
            renderTasks(data);

            setTimeout(() => {
                const updatedRect = activeTopicButton.getBoundingClientRect();
                sidebar.style.top = `${updatedRect.top - 2}px`;
            }, 100);
        })
        .catch(error => {
            console.error("Ошибка:", error);
            container.innerHTML = '<div class="error">Ошибка загрузки</div>';
        });
}

function hideTasks() {
    if (!isSidebarVisible) return;

    const sidebar = document.getElementById('tasksSidebar');
    const isHoveringSidebar = sidebar.matches(':hover');
    const isHoveringButton = activeTopicButton?.matches(':hover');

    if (!isHoveringSidebar && !isHoveringButton) {
        sidebar.classList.remove('visible');
        activeTopicButton?.classList.remove('active-topic');
        activeTopicButton = null;
        isSidebarVisible = false;
    }
}

// Обработчики событий
document.addEventListener('mousemove', function(event) {
    if (!isSidebarVisible) return;

    const sidebar = document.getElementById('tasksSidebar');
    const isHoveringSidebar = sidebar.contains(event.target);
    const isHoveringButton = activeTopicButton?.contains(event.target);

    if (!isHoveringSidebar && !isHoveringButton) {
        hideTasks();
    }
});

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
