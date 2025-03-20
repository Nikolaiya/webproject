// Функция для открытия окна входа
function openLogin() {
    closeAll();
    document.getElementById("overlay").classList.add("active");
    document.getElementById("loginModal").classList.add("active");
}

// Функция для открытия окна регистрации
function openRegister() {
    closeAll();
    let overlay = document.getElementById("overlay");
    let registerModal = document.getElementById("registerModal");

    if (overlay && registerModal) {
        overlay.classList.add("active");
        registerModal.classList.add("active");
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
function validateLogin() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch('/validate_login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Ошибка:', error));
}

// Функция для валидации регистрации
function validateRegister() {
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeatPassword").value;
    const birthdate = document.getElementById("birthdate").value;

    fetch('/validate_register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, email, password, repeat_password: repeatPassword, birthdate }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/';
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Ошибка:', error));
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