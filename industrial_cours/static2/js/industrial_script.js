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
            // Обновляем данные для поиска
            updateTopicTasks(topicId, data.tasks);
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
        <div class="materials-section">
            <h3 class="materials-title">Материалы</h3>
            <div class="materials-content">Материалы пока не доступны</div>
        </div>
    `;

    // Добавляем секции для каждого типа заданий
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

// Обновленная функция toggleArrow
function toggleArrow(event, element) {
    event.stopPropagation();

    const topicBox = element.closest('.topic-box');
    const containerItem = topicBox.closest('.topic-container-item');
    const expandableContent = containerItem.querySelector('.expandable-content');
    const topicId = containerItem.dataset.topicId;

    // Переключаем состояние
    const isExpanding = !expandableContent.classList.contains('expanded');
    element.classList.toggle('arrow-down');
    topicBox.classList.toggle('expanded');
    expandableContent.classList.toggle('expanded');

    // Обновляем текст стрелки
    element.textContent = element.classList.contains('arrow-down') ? '▲' : '▼';

    if (isExpanding) {
        // Если контент раскрывается, загружаем задания
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

// Функция для показа/скрытия меню фильтра
function toggleFilterMenu() {
    const menu = document.getElementById('filterMenu');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
        // Заполняем меню темами при первом открытии
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

    // Очищаем контейнер перед заполнением
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

        // Обработчик для всего элемента option
        option.addEventListener('click', function(e) {
            // Переключаем состояние checkbox
            const checkbox = this.querySelector('.filter-checkbox');
            checkbox.classList.toggle('checked');

            // Можно также добавить здесь вызов applyFilter(),
            // если нужно применять фильтр сразу при выборе
        });

        optionsContainer.appendChild(option);
    });
}

// Применение фильтра
function applyFilter() {
    const checkedOptions = document.querySelectorAll('.filter-checkbox.checked');
    const topics = document.querySelectorAll('.topic-container-item');

    if (checkedOptions.length === 0) {
        // Если ничего не выбрано, показываем все темы
        topics.forEach(topic => {
            topic.style.display = 'block';
        });
    } else {
        // Скрываем все темы
        topics.forEach(topic => {
            topic.style.display = 'none';
        });

        // Показываем только выбранные
        checkedOptions.forEach(option => {
            const topicId = option.closest('.filter-option').dataset.topicId;
            document.querySelector(`.topic-container-item[data-topic-id="${topicId}"]`).style.display = 'block';
        });
    }

    // Закрываем меню фильтра
    document.getElementById('filterMenu').style.display = 'none';
}

// Глобальные переменные для хранения данных
let allTopicsData = [];
let allTasksData = {};

document.addEventListener("DOMContentLoaded", function() {
    loadAllTopicsAndTasks();

    // Обработчики для поиска
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    searchBtn.addEventListener('click', () => performSearch(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(searchInput.value);
    });
});

// Функция для загрузки всех данных при старте
function loadAllTopicsData() {
    const topicContainers = document.querySelectorAll('.topic-container-item');

    topicContainers.forEach(container => {
        const topicId = container.dataset.topicId;
        const topicTitle = container.querySelector('.button-text').textContent;

        allTopicsData.push({
            id: topicId,
            title: topicTitle,
            tasks: [] // Задания будем заполнять при открытии темы
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

async function loadAllTopicsAndTasks() {
    const topicContainers = document.querySelectorAll('.topic-container-item');

    for (const container of topicContainers) {
        const topicId = container.dataset.topicId;
        const topicTitle = container.querySelector('.button-text').textContent;

        // Добавляем тему
        allTopicsData.push({
            id: topicId,
            title: topicTitle,
            tasks: []
        });

        // Загружаем задачи для темы
        try {
            const response = await fetch(`/industrial-course/get-tasks/${topicId}`);
            if (!response.ok) throw new Error('Ошибка сервера');

            const data = await response.json();
            if (data.tasks && Array.isArray(data.tasks)) {
                allTasksData[topicId] = data.tasks;

                // Обновляем данные для поиска
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

        // 1. Точное совпадение типа "PyGame1"
        if (exactMatch) {
            const searchNum = exactMatch[1];
            shouldShow = topicData.title.replace(/\D/g, '') === searchNum;
        }

        // 2. Частичное совпадение "pygame"
        else if (partialMatch) {
            shouldShow = topicData.title.toLowerCase().includes('pygame');
        }

        // 3. Поиск по ключевым словам в названии темы
        else {
            const titleWords = topicData.title.toLowerCase().split(/\s+/);
            shouldShow = searchWords.every(word =>
                titleWords.some(titleWord => titleWord.includes(word))
            );
        }

        // 4. Если не нашли в теме — ищем в задачах этой темы
        if (!shouldShow && allTasksData[topicId]) {
            const hasMatchingTask = allTasksData[topicId].some(task =>
                searchRegex.test(task.title)
            );
            if (hasMatchingTask) shouldShow = true;
        }

        // Показываем/прячем
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


document.addEventListener("DOMContentLoaded", function() {
    loadAllTopicsData();

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn && searchInput) {
        // Поиск при клике на кнопку
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });

        // Поиск при нажатии Enter в поле ввода
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
});