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

// Функция для показа окна ошибки если попытаться зайти в тему без входа
function showErrorModal() {
    const modal = document.getElementById('authErrorModal');
    modal.classList.remove('active');

    void modal.offsetWidth;

    modal.classList.add('active');
    modal.addEventListener('click', closeOnOutsideClick);
}

// Функция для скрытия окна ошибки если попытаться зайти в тему без входа
function closeErrorModal() {
    const modal = document.getElementById('authErrorModal');
    modal.classList.remove('active');
    modal.removeEventListener('click', closeOnOutsideClick);
}

// Функция для скрытия окна ошибки если попытаться зайти в тему без входа, но при клике в другой области
function closeOnOutsideClick(event) {
    const modalContent = document.querySelector('.error-modal-content');
    if (!modalContent.contains(event.target)) {
        closeErrorModal();
    }
}

// Функция для обработки клика по теме
function handleTopicClick(event) {
    const topicBox = event.target.closest('.topic-box');
    if (!topicBox) return;

    if (!document.querySelector('.user-btn')) {
        event.preventDefault();
        showErrorModal();
        return;
    }

    const topicId = topicBox.dataset.topicId;
    window.location.href = `/industrial-course/pygame${topicId}`;
}

// Основная функция для загрузки и отображения заданий
async function loadTasksForTopic(topicId, container) {
    if (!document.querySelector('.user-btn')) {
        container.innerHTML = `
            <div class="not-authorized-message">
                Ошибка: для начала войдите в аккаунт!
            </div>
        `;
        return;
    }

    container.innerHTML = '<div class="loading-content">Загрузка заданий...</div>';

    try {
        const response = await fetch(`/industrial-course/get-tasks/${topicId}`);
        if (!response.ok) throw new Error('Сервер вернул ошибку');

        const data = await response.json();
        if (!data || !Array.isArray(data.tasks)) {
            throw new Error('Неверный формат данных');
        }

        updateTopicTasks(topicId, data.tasks);
        renderTasksContent(data, container);
    } catch (error) {
        console.error("Ошибка:", error);
        container.innerHTML = `
            <div class="error-content">
                Ошибка: ${error.message}
            </div>
        `;
    }
}

// Функция для отрисовки заданий в expandable-content
function renderTasksContent(data, container) {
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
        <div class="materials-section">
            <h3 class="materials-title">Материалы</h3>
            <div class="materials-content">Материалы пока не доступны</div>
        </div>
    `;

    Object.entries(taskTypes).forEach(([type, title]) => {
        const tasks = data.tasks.filter(task => task.task_type === type);

        html += `
            <div class="quick-access-section">
                <h3 class="quick-access-title">${title}</h3>
                <div class="quick-access-list">
                    ${tasks.length ?
                        tasks.map(task => `
                            <div class="quick-access-item"
                                 onclick="window.location.href='/industrial-course/pygame${task.topic_id}/task/${task.id}'">
                                ${task.title || 'Без названия'}
                            </div>
                        `).join('') :
                        '<div class="no-tasks">Задания отсутствуют</div>'
                    }
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Функция для Стрелок(быстрый доступ)
function toggleArrow(event, element) {
    event.stopPropagation();

    const topicBox = element.closest('.topic-box');
    const containerItem = topicBox.closest('.topic-container-item');
    const expandableContent = containerItem.querySelector('.expandable-content');
    const topicId = containerItem.dataset.topicId;

    const isExpanding = !expandableContent.classList.contains('expanded');
    element.classList.toggle('arrow-down');
    topicBox.classList.toggle('expanded');
    expandableContent.classList.toggle('expanded');

    element.textContent = element.classList.contains('arrow-down') ? '▲' : '▼';

    if (isExpanding) {
        loadTasksForTopic(topicId, expandableContent);
    }
}

// Загружает задания темы при открытии страницы.
document.addEventListener("DOMContentLoaded", function() {
    const topicId = window.location.pathname.match(/pygame(\d+)/)[1];

    if (!document.querySelector('.user-btn')) {
        showNotAuthorized();
        return;
    }

    loadTasks(topicId);
});

// Показывает сообщение "Ошибка: для начала войдите в аккаунт!".
function showNotAuthorized() {
    const container = document.querySelector('.pygame-tasks-container');
    container.innerHTML = `
        <div class="not-authorized-message">
            Ошибка: для начала войдите в аккаунт!
        </div>
    `;
}

// Загружает задания для темы
async function loadTasks(topicId) {
    try {
        const response = await fetch(`/industrial-course/get-tasks/${topicId}`);
        if (!response.ok) throw new Error('Сервер вернул ошибку');

        const data = await response.json();
        if (!data || !Array.isArray(data.tasks)) {
            throw new Error('Неверный формат данных');
        }

        renderTasks(data.tasks);
    } catch (error) {
        console.error("Ошибка:", error);
        const container = document.querySelector('.pygame-tasks-container');
        container.innerHTML = `
            <div class="error-content">
                Ошибка загрузки заданий: ${error.message}
            </div>
        `;
    }
}

// Отображает задания на странице
function renderTasks(tasks) {
    const taskTypes = {
        'class': 'class-tasks',
        'home': 'home-tasks',
        'extra': 'extra-tasks'
    };

    Object.values(taskTypes).forEach(id => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });

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

// Функция для возвращения назад на курс
function goBackToTopics() {
    window.location.href = '/industrial-course/';
}

// Функция для показа/скрытия меню фильтра
function toggleFilterMenu() {
    const menu = document.getElementById('filterMenu');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';

        if (!menu.dataset.populated) {
            populateFilterMenu();
            menu.dataset.populated = 'true';
        }
    }
}

// Заполнение меню темами
function populateFilterMenu() {
    const optionsContainer = document.querySelector('.filter-options');
    const topics = document.querySelectorAll('.topic-container-item');

    optionsContainer.innerHTML = '';

    topics.forEach(topic => {
        const topicId = topic.dataset.topicId;
        const topicTitle = topic.querySelector('.button-text').textContent;

        const option = document.createElement('div');
        option.className = 'filter-option';
        option.dataset.topicId = topicId;

        option.innerHTML = `
            <div class="filter-checkbox"></div>
            <span class="filter-option-text">${topicTitle}</span>
        `;

        option.addEventListener('click', function(e) {
            const checkbox = this.querySelector('.filter-checkbox');
            checkbox.classList.toggle('checked');
        });

        optionsContainer.appendChild(option);
    });
}

// Применение фильтра
function applyFilter() {
    const checkedOptions = document.querySelectorAll('.filter-checkbox.checked');
    const topics = document.querySelectorAll('.topic-container-item');

    if (checkedOptions.length === 0) {
        topics.forEach(topic => {
            topic.style.display = 'block';
        });
    } else {
        topics.forEach(topic => {
            topic.style.display = 'none';
        });

        checkedOptions.forEach(option => {
            const topicId = option.closest('.filter-option').dataset.topicId;
            document.querySelector(`.topic-container-item[data-topic-id="${topicId}"]`).style.display = 'block';
        });
    }

    document.getElementById('filterMenu').style.display = 'none';
}

// Глобальные переменные для хранения данных
let allTopicsData = [];
let allTasksData = {};

// Функция для загрузки всех данных при старте
function loadAllTopicsData() {
    const topicContainers = document.querySelectorAll('.topic-container-item');

    topicContainers.forEach(container => {
        const topicId = container.dataset.topicId;
        const topicTitle = container.querySelector('.button-text').textContent;

        allTopicsData.push({
            id: topicId,
            title: topicTitle,
            tasks: []
        });
    });
}

// Функция для обновления данных заданий при открытии темы
function updateTopicTasks(topicId, tasks) {
    const topic = allTopicsData.find(t => t.id === topicId);
    if (topic) {
        topic.tasks = tasks.map(task => ({
            id: task.id,
            title: task.title,
            type: task.task_type
        }));
    }
}

// Загрузка заданий для курса
async function loadAllTopicsAndTasks() {
    const topicContainers = document.querySelectorAll('.topic-container-item');

    for (const container of topicContainers) {
        const topicId = container.dataset.topicId;
        const topicTitle = container.querySelector('.button-text').textContent;

        allTopicsData.push({
            id: topicId,
            title: topicTitle,
            tasks: []
        });

        try {
            const response = await fetch(`/industrial-course/get-tasks/${topicId}`);
            if (!response.ok) throw new Error('Ошибка сервера');

            const data = await response.json();
            if (data.tasks && Array.isArray(data.tasks)) {
                allTasksData[topicId] = data.tasks;

                const topic = allTopicsData.find(t => t.id === topicId);
                if (topic) {
                    topic.tasks = data.tasks.map(task => ({
                        id: task.id,
                        title: task.title,
                        type: task.task_type
                    }));
                }
            }
        } catch (error) {
            console.error(`Ошибка загрузки задач для темы ${topicId}:`, error);
        }
    }
}

// Функция поиска
function performSearch(searchTerm) {
    const searchText = searchTerm.trim();

    if (!searchText) {
        document.querySelectorAll('.topic-container-item').forEach(topic => {
            topic.style.display = 'block';
        });
        return;
    }

    let foundAny = false;
    const exactMatch = searchText.match(/^PyGame(\d+)$/i);
    const partialMatch = searchText.toLowerCase().includes('pygame');
    const searchWords = searchText.toLowerCase().split(/\s+/);
    const searchRegex = new RegExp(searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

    document.querySelectorAll('.topic-container-item').forEach(topic => {
        const topicId = topic.dataset.topicId;
        const topicData = allTopicsData.find(t => t.id === topicId);
        let shouldShow = false;

        if (!topicData) return;

        if (exactMatch) {
            const searchNum = exactMatch[1];
            shouldShow = topicData.title.replace(/\D/g, '') === searchNum;
        }

        else if (partialMatch) {
            shouldShow = topicData.title.toLowerCase().includes('pygame');
        }

        else {
            const titleWords = topicData.title.toLowerCase().split(/\s+/);
            shouldShow = searchWords.every(word =>
                titleWords.some(titleWord => titleWord.includes(word))
            );
        }

        if (!shouldShow && allTasksData[topicId]) {
            const hasMatchingTask = allTasksData[topicId].some(task =>
                searchRegex.test(task.title)
            );
            if (hasMatchingTask) shouldShow = true;
        }

        topic.style.display = shouldShow ? 'block' : 'none';

        if (shouldShow) {
            foundAny = true;
            if (searchText.length > 2) {
                const topicBox = topic.querySelector('.topic-box');
                topicBox.classList.add('highlight');
                setTimeout(() => topicBox.classList.remove('highlight'), 2000);
            }
        }
    });

    if (!foundAny) {
        console.log("Ничего не найдено по запросу:", searchText);
    }
}

// Обработчик нажатий на кнопку поиска при клике на лупу или на enter
document.addEventListener("DOMContentLoaded", function() {
    loadAllTopicsData();
    loadAllTopicsAndTasks();

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
});

// Загрузка решений при открытии страницы задания
async function loadSolutions(taskId) {
    try {
        const response = await fetch(`/industrial-course/get-solutions/${taskId}`);
        const data = await response.json();
        const solutionsList = document.getElementById('solutions-list');

        if (data.solutions?.length > 0) {
            solutionsList.innerHTML = data.solutions.map(solution => `
                <div class="solution-item">
                    <div class="solution-header">
                        <span>${solution.username}</span>
                        <span>${new Date(solution.created_at).toLocaleString()}</span>
                    </div>
                    <div class="solution-content">${solution.solution_text}</div>
                </div>
            `).join('');
        } else {
            solutionsList.innerHTML = '<p>Пока нет предложенных решений</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки решений:', error);
    }
}

// Отправка своего решения
document.addEventListener('DOMContentLoaded', function() {
    const solutionForm = document.getElementById('solution-form');
    if (solutionForm) {
        const taskId = window.location.pathname.match(/task\/(\d+)/)[1];

        loadSolutions(taskId);

        solutionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const solutionText = document.getElementById('solution-text').value;

            if (!solutionText.trim()) {
                alert('Решение не может быть пустым');
                return;
            }

            fetch(`/industrial-course/submit-solution/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `solution_text=${encodeURIComponent(solutionText)}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert('Ошибка: ' + data.error);
                } else {
                    document.getElementById('solution-text').value = '';
                    loadSolutions(taskId);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
        });
    }
});

// Обработчик нажатий на кнопку отправить своё решение
document.addEventListener('DOMContentLoaded', function() {
    const showSolutionBtn = document.getElementById('show-solution-btn');
    if (showSolutionBtn) {
        showSolutionBtn.addEventListener('click', function() {
            const currentCount = parseInt(document.getElementById('answer-count').textContent);

            if (currentCount <= 0) {
                showNoViewsModal();
                return;
            }

            document.getElementById('solution-content').style.display = 'block';
            showSolutionBtn.style.display = 'none';

            const newCount = currentCount - 1;
            updateSolutionsCount(newCount);
        });
    }
});


// Закрытие модального окна при клике вне его
window.addEventListener('click', function(event) {
    const modal = document.getElementById('no-views-modal');
    if (event.target === modal) {
        closeNoViewsModal();
    }
});


// Функция для показа окна покупки решений если они закончились
function showNoViewsModal() {
    const modal = document.getElementById('no-views-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Функция для скрытия окна покупки решений
function closeNoViewsModal() {
    const modal = document.getElementById('no-views-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}