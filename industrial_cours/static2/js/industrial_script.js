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

function showErrorModal() {
    const modal = document.getElementById('authErrorModal');
    // Удаляем класс, если был (на случай повторного открытия)
    modal.classList.remove('active');

    // Триггерим reflow для сброса анимации
    void modal.offsetWidth;

    // Добавляем класс с анимацией
    modal.classList.add('active');
    modal.addEventListener('click', closeOnOutsideClick);
}

function closeErrorModal() {
    const modal = document.getElementById('authErrorModal');
    modal.classList.remove('active');
    modal.removeEventListener('click', closeOnOutsideClick);
}

function closeOnOutsideClick(event) {
    const modalContent = document.querySelector('.error-modal-content');
    if (!modalContent.contains(event.target)) {
        closeErrorModal();
    }
}

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

function handleTopicClick(event) {
    // Проверяем, был ли клик по самой кнопке или ее дочерним элементам
    const topicBox = event.target.closest('.topic-box');
    if (!topicBox) return;

    // Проверяем авторизацию
    if (!document.querySelector('.user-btn')) {
        event.preventDefault();
        showErrorModal();
        return;
    }

    // Если пользователь авторизован - переходим на страницу темы
    const topicId = topicBox.dataset.topicId;
    window.location.href = `/industrial-course/pygame${topicId}`;
}

// Основная функция для загрузки и отображения заданий
function loadTasksForTopic(topicId, container) {
    // Проверяем авторизацию
    if (!document.querySelector('.user-btn')) {
        container.innerHTML = `
            <div class="not-authorized-message">
                Ошибка: для начала войдите в аккаунт!
            </div>
        `;
        return;
    }

    // Остальной код загрузки заданий...
    container.innerHTML = '<div class="loading-content">Загрузка заданий...</div>';

    fetch(`/industrial-course/get-tasks/${topicId}`)
        .then(response => {
            if (!response.ok) throw new Error('Сервер вернул ошибку');
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data.tasks)) {
                throw new Error('Неверный формат данных');
            }
            renderTasksContent(data, container);
        })
        .catch(error => {
            console.error("Ошибка:", error);
            container.innerHTML = `
                <div class="error-content">
                    Ошибка: ${error.message}
                </div>
            `;
        });
}

// Функция для отрисовки заданий в expandable-content
function renderTasksContent(data, container) {
    // Проверка на наличие данных
    if (!data || !data.tasks) {
        container.innerHTML = '<div class="error-content">Нет данных о заданиях</div>';
        return;
    }

    const taskTypes = {
        'class': 'Классная работа',
        'home': 'Домашняя работа',
        'extra': 'Дополнительные задачи'
    };

    let html = `
        <div class="content-section">
            <div class="section-title">Материалы</div>
            <div class="section-content unavailable">Пока не доступно</div>
        </div>
    `;

    // Добавляем секции для каждого типа заданий
    Object.entries(taskTypes).forEach(([type, title]) => {
        const tasks = data.tasks.filter(task => task.task_type === type);

        html += `
            <div class="content-section">
                <div class="section-title">${title}</div>
                ${tasks.length ?
                    tasks.map(task => `
                        <div class="task-item" onclick="window.location.href='/industrial-course/pygame${task.topic_id}/task/${task.id}'">
                            ${task.title || 'Без названия'}
                        </div>
                    `).join('') :
                    '<div class="no-tasks">Задания отсутствуют</div>'
                }
            </div>
        `;
    });

    container.innerHTML = html;
}

// Обновленная функция toggleArrow
function toggleArrow(event, element) {
    event.stopPropagation();

    const topicBox = element.closest('.topic-box');
    const containerItem = topicBox.closest('.topic-container-item');
    const expandableContent = containerItem.querySelector('.expandable-content');
    const topicId = containerItem.dataset.topicId;

    // Переключаем состояние
    element.classList.toggle('arrow-down');
    topicBox.classList.toggle('expanded');
    expandableContent.classList.toggle('expanded');

    // Обновляем текст стрелки
    element.textContent = element.classList.contains('arrow-down') ? '▲' : '▼';

    // Если контент раскрывается, загружаем задания
    if (element.classList.contains('arrow-down')) {
        loadTasksForTopic(topicId, expandableContent);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    // Получаем ID темы из URL (например, /pygame1 -> 1)
    const topicId = window.location.pathname.match(/pygame(\d+)/)[1];

    // Проверяем авторизацию
    if (!document.querySelector('.user-btn')) {
        showNotAuthorized();
        return;
    }

    // Загружаем задания для текущей темы
    loadTasks(topicId);
});

function showNotAuthorized() {
    const container = document.querySelector('.pygame-tasks-container');
    container.innerHTML = `
        <div class="not-authorized-message">
            Ошибка: для начала войдите в аккаунт!
        </div>
    `;
}

function loadTasks(topicId) {
    fetch(`/industrial-course/get-tasks/${topicId}`)
        .then(response => {
            if (!response.ok) throw new Error('Сервер вернул ошибку');
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data.tasks)) {
                throw new Error('Неверный формат данных');
            }
            renderTasks(data.tasks);
        })
        .catch(error => {
            console.error("Ошибка:", error);
            const container = document.querySelector('.pygame-tasks-container');
            container.innerHTML = `
                <div class="error-content">
                    Ошибка загрузки заданий: ${error.message}
                </div>
            `;
        });
}

function renderTasks(tasks) {
    const taskTypes = {
        'class': 'class-tasks',
        'home': 'home-tasks',
        'extra': 'extra-tasks'
    };

    // Очищаем все списки
    Object.values(taskTypes).forEach(id => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });

    // Группируем задания по типам
    const groupedTasks = {
        'class': [],
        'home': [],
        'extra': []
    };

    tasks.forEach(task => {
        if (groupedTasks[task.task_type]) {
            groupedTasks[task.task_type].push(task);
        }
    });

    // Рендерим задания для каждого типа
    Object.entries(taskTypes).forEach(([type, containerId]) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (groupedTasks[type].length === 0) {
            container.innerHTML = '<div class="no-tasks">Задания отсутствуют</div>';
            return;
        }

        groupedTasks[type].forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'pygame-task-item';
            taskElement.textContent = task.title || 'Без названия';
            taskElement.onclick = () => {
                window.location.href = `/industrial-course/pygame${task.topic_id}/task/${task.id}`;
            };
            container.appendChild(taskElement);
        });
    });
}

function goBackToTopics() {
    window.location.href = '/industrial-course/';
}