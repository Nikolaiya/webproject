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