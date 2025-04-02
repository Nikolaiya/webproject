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

// Основная функция для загрузки и отображения заданий
function loadTasksForTopic(topicId, container) {
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

            // Добавляем topic_id к данным, если его нет
            const enhancedData = {
                ...data,
                topic: { id: topicId } // Добавляем информацию о теме
            };
            renderTasksContent(enhancedData, container);
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
    element.textContent = element.classList.contains('arrow-down') ? '▼' : '▲';

    // Если контент раскрывается, загружаем задания
    if (element.classList.contains('arrow-down')) {
        loadTasksForTopic(topicId, expandableContent);
    }
}