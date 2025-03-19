function openLogin() {
    closeAll();
    document.getElementById("overlay").classList.add("active");
    document.getElementById("loginModal").classList.add("active");
}

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

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggleIcon = document.querySelector(`#${inputId} + .toggle-password`);

    if (input.type === "password") {
        input.type = "text";
        toggleIcon.textContent = "👁️"; // Меняем иконку на "глаз открыт"
    } else {
        input.type = "password";
        toggleIcon.textContent = "👁️‍🗨️"; // Меняем иконку на "глаз закрыт"
    }
}

function handlePasswordInput(input) {
    const toggleIcon = input.nextElementSibling;
    if (input.value.length > 0) {
        toggleIcon.classList.add("visible"); // Показываем значок, если поле не пустое
    } else {
        toggleIcon.classList.remove("visible"); // Скрываем значок, если поле пустое
    }
}

function closeAll() {
    // Закрываем модальные окна
    document.getElementById("overlay").classList.remove("active");
    document.getElementById("loginModal").classList.remove("active");
    document.getElementById("registerModal").classList.remove("active");

    // Очищаем поля и скрываем значки глаза
    const loginFields = document.querySelectorAll("#loginModal input");
    loginFields.forEach(field => {
        field.value = "";
        field.classList.remove("error-input");
        const toggleIcon = field.nextElementSibling;
        if (toggleIcon && toggleIcon.classList.contains('toggle-password')) {
            toggleIcon.classList.remove("visible"); // Скрываем значок глаза
        }
    });

    const registerFields = document.querySelectorAll("#registerModal input");
    registerFields.forEach(field => {
        field.value = "";
        field.classList.remove("error-input");
        const toggleIcon = field.nextElementSibling;
        if (toggleIcon && toggleIcon.classList.contains('toggle-password')) {
            toggleIcon.classList.remove("visible"); // Скрываем значок глаза
        }
    });

    const warningIcons = document.querySelectorAll(".warning-icon");
    warningIcons.forEach(icon => {
        icon.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const passwordInputs = document.querySelectorAll('.password-container input[type="password"]');
    passwordInputs.forEach(input => {
        // Создаем значок глаза, если он ещё не добавлен
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('toggle-password')) {
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-password';
            toggleIcon.textContent = "👁️‍🗨️"; // Иконка по умолчанию (глаз закрыт)
            toggleIcon.onclick = () => togglePasswordVisibility(input.id);
            input.parentNode.appendChild(toggleIcon);

            // Добавляем обработчик события ввода
            input.addEventListener('input', () => handlePasswordInput(input));

            // Проверяем поле при загрузке страницы (на случай, если поле уже заполнено)
            handlePasswordInput(input);
        }
    });
});

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

function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return "Пароль должен содержать минимум 8 символов.";
    }
    if (!hasUpperCase) {
        return "Пароль должен содержать хотя бы одну букву в верхнем регистре.";
    }
    if (!hasLowerCase) {
        return "Пароль должен содержать хотя бы одну букву в нижнем регистре.";
    }
    if (!hasSpecialChar) {
        return "Пароль должен содержать хотя бы один специальный символ (!, @, #, и т.д.).";
    }
    return null; // Пароль валиден
}

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

function toggleMenu() {
    let menu = document.getElementById("userMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

document.addEventListener("click", function (event) {
    let menu = document.getElementById("userMenu");
    let btn = document.querySelector(".user-btn");

    if (menu && btn && !btn.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = "none";
    }
});

document.getElementById("login-btn").addEventListener("click", function(event) {
    event.preventDefault();
    validateLogin();
});

document.getElementById("register-btn").addEventListener("click", function(event) {
    event.preventDefault();
    validateRegister();
});

function openSolutions() {
    const solutionsCount = parseInt(document.getElementById("answer-count").textContent, 10);

    if (solutionsCount === 0) {
        // Открываем пустое белое окно
        const emptyModal = document.createElement('div');
        emptyModal.className = 'empty-modal';
        emptyModal.innerHTML = `
            <div class="empty-modal-content">
                <p>У вас закончились просмотры решений.</p>
            </div>
        `;
        document.body.appendChild(emptyModal);
    } else {
        // Логика для просмотра решений
        alert("Просмотр решений...");
    }
}

document.getElementById("new-btn").addEventListener("click", openSolutions);