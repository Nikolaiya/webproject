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
