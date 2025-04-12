// Функция для открытия окна входа
function openLogin() {
    closeAll();
    document.getElementById("overlay").style.zIndex = "1500";
    document.getElementById("loginModal").style.zIndex = "2000";
    document.getElementById("overlay").classList.add("active");
    document.getElementById("loginModal").classList.add("active");
}

// Функция для открытия окна регистрации
function openRegister() {
    closeAll();
    let overlay = document.getElementById("overlay");
    let registerModal = document.getElementById("registerModal");

    if (overlay && registerModal) {
    document.getElementById("overlay").style.zIndex = "1500";
    document.getElementById("registerModal").style.zIndex = "2000";
    document.getElementById("overlay").classList.add("active");
    document.getElementById("registerModal").classList.add("active");
    } else {
        console.error("❌ Ошибка: Окно регистрации не найдено в DOM");
    }
}

// Функция для переключения видимости пароля
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleIcon = document.querySelector(`#${inputId} + .toggle-password`);

    if (input.type === "password") {
        input.type = "text";
        toggleIcon.textContent = "👁️";
    } else {
        input.type = "password";
        toggleIcon.textContent = "👁️‍🗨️";
    }
}

// Функция для обработки ввода пароля
function handlePasswordInput(input) {
    const toggleIcon = input.nextElementSibling;
    if (input.value.length > 0) {
        toggleIcon.classList.add("visible");
    } else {
        toggleIcon.classList.remove("visible");
    }
}

// Функция для закрытия окна и сброса полей ввода
function closeAll() {
    document.getElementById("overlay").classList.remove("active");
    document.getElementById("loginModal").classList.remove("active");
    document.getElementById("registerModal").classList.remove("active");
    document.getElementById("forgotPasswordModal").classList.remove("active");
    document.getElementById("newPasswordModal").classList.remove("active");

    const loginFields = document.querySelectorAll("#loginModal input");
    loginFields.forEach(field => {
        field.value = "";
        field.classList.remove("error-input");
        const toggleIcon = field.nextElementSibling;
        if (toggleIcon && toggleIcon.classList.contains('toggle-password')) {
            toggleIcon.classList.remove("visible");
        }
    });

    const registerFields = document.querySelectorAll("#registerModal input");
    registerFields.forEach(field => {
        field.value = "";
        field.classList.remove("error-input");
        const toggleIcon = field.nextElementSibling;
        if (toggleIcon && toggleIcon.classList.contains('toggle-password')) {
            toggleIcon.classList.remove("visible");
        }
    });

    const warningIcons = document.querySelectorAll(".warning-icon");
    warningIcons.forEach(icon => {
        icon.style.display = "none";
    });
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
    const passwordInputs = document.querySelectorAll('.password-container input[type="password"]');
    passwordInputs.forEach(input => {
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('toggle-password')) {
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-password';
            toggleIcon.textContent = "👁️‍🗨️";
            toggleIcon.onclick = () => togglePasswordVisibility(input.id);
            input.parentNode.appendChild(toggleIcon);

            input.addEventListener('input', () => handlePasswordInput(input));

            handlePasswordInput(input);
        }
    });
});

// Функция для валидации входа
async function validateLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch('/validate_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Функция для валидации регистрации
async function validateRegister() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeatPassword").value;
    const birthdate = document.getElementById("birthdate").value;

    try {
        const response = await fetch('/validate_register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, surname, email, password, repeat_password: repeatPassword, birthdate }),
        });
        const data = await response.json();
        if (data.success) {
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Функция для переключения меню пользователя
function toggleMenu() {
    let menu = document.getElementById("userMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Закрывает меню пользователя при клике вне его области
document.addEventListener("click", function (event) {
    let menu = document.getElementById("userMenu");
    let btn = document.querySelector(".user-btn");

    if (menu && btn && !btn.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = "none";
    }
});

// Добавляет обработчик клика на кнопку входа
document.getElementById("login-btn").addEventListener("click", function(event) {
    event.preventDefault();
    validateLogin();
});

// Добавляет обработчик клика на кнопку регистрации
document.getElementById("register-btn").addEventListener("click", function(event) {
    event.preventDefault();
    validateRegister();
});

// Добавляет обработчик клика на кнопку забыли пароль
document.querySelector(".forgot-password").addEventListener("click", function (event) {
    event.preventDefault();
    closeAll();
    document.getElementById("overlay").style.zIndex = "1500";
    document.getElementById("forgotPasswordModal").style.zIndex = "2000";
    document.getElementById("overlay").classList.add("active");
    document.getElementById("forgotPasswordModal").classList.add("active");
});

// Функция для проверки данных аккаунта
async function validateAccountData() {
    const name = document.getElementById("forgot-name").value;
    const surname = document.getElementById("forgot-surname").value;
    const email = document.getElementById("forgot-email").value;
    const birthdate = document.getElementById("forgot-birthdate").value;

    try {
        const response = await fetch('/validate_account_data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, surname, email, birthdate }),
        });
        const data = await response.json();
        if (data.success) {
            closeAll();
            document.getElementById("overlay").style.zIndex = "1500";
            document.getElementById("newPasswordModal").style.zIndex = "2000";
            document.getElementById("overlay").classList.add("active");
            document.getElementById("newPasswordModal").classList.add("active");
        } else {
            alert("Введённые вами данные аккаунта различны с данными регистрации");
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Добавляем обработчик для кнопки "Продолжить" в окне восстановления пароля
document.getElementById("forgot-submit-btn").addEventListener("click", function (event) {
    event.preventDefault();
    validateAccountData();
});

// Функция для смены пароля
async function changePassword() {
    const newPassword = document.getElementById("new-password").value;
    const confirmNewPassword = document.getElementById("confirm-new-password").value;
    const email = sessionStorage.getItem("recovery_email");

    if (newPassword !== confirmNewPassword) {
        alert("Пароли не совпадают");
        return;
    }

    try {
        const response = await fetch('/change_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword, email }),
        });

        const data = await response.json();

        if (data.success) {
            alert("Пароль успешно изменён. Вы будете перенаправлены на главную страницу.");
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error("Ошибка при смене пароля:", err);
        alert("Что-то пошло не так...");
    }
}


// Добавляем обработчик для кнопки "Сохранить" в окне нового пароля
document.getElementById("new-password-submit-btn").addEventListener("click", function (event) {
    event.preventDefault();
    changePassword();
});

// Можно добавить обработчики для заданий, если нужно
document.querySelectorAll('.task-box').forEach(task => {
    task.addEventListener('click', () => {
        task.style.backgroundColor = '#e0e0e0';
        setTimeout(() => {
            task.style.backgroundColor = '';
        }, 200);
    });
});

// функция работы с api для отображения времени
async function updateTime() {
    try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/Moscow');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const datetime = new Date(data.datetime);
        const timeString = datetime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const timeElement = document.getElementById('current-time');
        if (timeElement) timeElement.textContent = timeString;
    } catch (error) {
        console.error('Ошибка при получении времени:', error);
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('ru-RU');
            timeElement.title = "Локальное время";
        }
    }
}

// Инициализация часов
document.addEventListener('DOMContentLoaded', function() {
    let timeElement = document.getElementById('current-time');
    if (!timeElement) {
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            timeElement = document.createElement('span');
            timeElement.id = 'current-time';
            timeElement.className = 'time-display';
            headerTitle.appendChild(timeElement);
        }
    }

    if (timeElement) {
        timeElement.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        timeElement.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }

    updateTime();
    setInterval(updateTime, 1000);
});

// Функция для обновления количества доступных решений при клике на кнопку показать решение
async function updateSolutionsCount(newCount) {
    try {
        const response = await fetch('/update_solutions_count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: newCount }),
        });
        const data = await response.json();
        if (data.error) {
            console.error('Ошибка обновления счетчика:', data.error);
        } else {
            document.getElementById('answer-count').textContent = newCount;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Функция для открытия модального окна с покупкой решений
function openViewsModal() {
    const modal = document.getElementById('viewsModal');
    modal.style.display = 'flex';
}

// Функция для закрытия модального окна с покупкой решений
function closeViewsModal() {
    const modal = document.getElementById('viewsModal');
    modal.style.display = 'none';
}

// Обработчик клика вне модального окна
window.addEventListener('click', function(event) {
    const modal = document.getElementById('viewsModal');
    if (event.target === modal) {
        closeViewsModal();
    }
});

// Обработчик клика на кнопку доступных решений
document.querySelector('.new-btn').addEventListener('click', function(event) {
    event.preventDefault();
    openViewsModal();
});