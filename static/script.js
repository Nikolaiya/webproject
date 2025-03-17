function openLogin() {
    closeAll();
    document.getElementById("overlay").classList.add("active");
    document.getElementById("loginModal").classList.add("active");
}

function openRegister() {
    closeAll();  // Закрываем все окна перед открытием
    let overlay = document.getElementById("overlay");
    let registerModal = document.getElementById("registerModal");

    if (overlay && registerModal) {
        overlay.classList.add("active");
        registerModal.classList.add("active");
    } else {
        console.error("❌ Ошибка: Окно регистрации не найдено в DOM");
    }
}


function closeAll() {
    document.getElementById("overlay").classList.remove("active");
    document.getElementById("loginModal").classList.remove("active");
    document.getElementById("registerModal").classList.remove("active");

    // Очистка полей входа
    const loginFields = document.querySelectorAll("#loginModal input");
    loginFields.forEach(field => {
        field.value = "";
        field.classList.remove("error-input");
    });

    // Очистка полей регистрации
    const registerFields = document.querySelectorAll("#registerModal input");
    registerFields.forEach(field => {
        field.value = "";
        field.classList.remove("error-input");
    });

    // Скрываем все предупреждения
    const warningIcons = document.querySelectorAll(".warning-icon");
    warningIcons.forEach(icon => {
        icon.style.display = "none";
    });
}

document.getElementById("birthdate").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 8); // Оставляем только цифры
    if (value.length >= 2) value = value.slice(0, 2) + "." + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + "." + value.slice(5);

    e.target.value = value;
});

function validateLogin() {
    let isValid = true;

    const fields = [
        { id: "login-email", message: "Это поле не может быть пустым" },
        { id: "login-password", message: "Это поле не может быть пустым" },
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const warningIcon = input.parentElement.querySelector(".warning-icon");

        if (!input.value.trim()) {
            input.classList.add("error-input");
            if (warningIcon) {
                warningIcon.style.display = "flex";
                warningIcon.setAttribute("data-tooltip", field.message);
            }
            isValid = false;
        } else {
            input.classList.remove("error-input");
            if (warningIcon) {
                warningIcon.style.display = "none";
            }
        }
    });

    return isValid;
}


function validateRegister() {
    let isValid = true;

    // Проверка всех полей на пустоту
    const fields = [
        { id: "name", message: "Это поле не может быть пустым" },
        { id: "surname", message: "Это поле не может быть пустым" },
        { id: "email", message: "Это поле не может быть пустым" },
        { id: "birthdate", message: "Это поле не может быть пустым" },
        { id: "password", message: "Это поле не может быть пустым" },
        { id: "repeatPassword", message: "Это поле не может быть пустым" },
    ];

    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const warningIcon = input.parentElement.querySelector(".warning-icon");

        if (!input.value.trim()) {
            input.classList.add("error-input");
            warningIcon.style.display = "flex";
            warningIcon.setAttribute("data-tooltip", field.message);
            isValid = false;
        } else {
            input.classList.remove("error-input");
            warningIcon.style.display = "none";
        }
    });

    const password = document.getElementById("password").value;
    const repeatPassword = document.getElementById("repeatPassword").value;
    if (password !== repeatPassword) {
        const repeatPassInput = document.getElementById("repeatPassword");
        const warningIcon = repeatPassInput.parentElement.querySelector(".warning-icon");

        repeatPassInput.classList.add("error-input");
        warningIcon.style.display = "flex";
        warningIcon.setAttribute("data-tooltip", "Пароли не совпадают");
        isValid = false;
    }

    // Проверка даты рождения (если она не пустая)
    const birthdate = document.getElementById("birthdate");
    const dateWarningIcon = document.getElementById("date-warning");

    if (birthdate.value.trim()) {
        const parts = birthdate.value.split(".");
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        const isDateValid = parts.length === 3
            && !isNaN(day) && !isNaN(month) && !isNaN(year)
            && day > 0 && day <= 31
            && month > 0 && month <= 12
            && year >= 1925 && year <= 2011;

        if (!isDateValid) {
            birthdate.classList.add("error-input");
            dateWarningIcon.style.display = "flex";
            dateWarningIcon.setAttribute("data-tooltip", "Введено некорректное значение");
            isValid = false;
        } else {
            birthdate.classList.remove("error-input");
            dateWarningIcon.style.display = "none";
        }
    }

    return isValid;
}

// Функция для добавления эффекта прогибания кнопки
function addSquishEffect(button) {
    button.addEventListener('mousedown', () => {
        button.classList.add('active'); // Добавляем класс для эффекта нажатия
    });

    button.addEventListener('mouseup', () => {
        button.classList.remove('active'); // Убираем класс после отпускания
    });

    button.addEventListener('mouseleave', () => {
        button.classList.remove('active'); // Убираем класс, если курсор ушёл с кнопки
    });
}

// Применяем эффект ко всем кнопкам
document.querySelectorAll('.auth-btn, .course-box, .modal-btn, .login-btn, .close-btn').forEach(button => {
    addSquishEffect(button);
});

// Функция для обновления значения цифры
function updateAnswerCount(value) {
    const answerCountElement = document.getElementById("answer-count");
    if (answerCountElement) {
        answerCountElement.textContent = value;
    }
}

// Функция для увеличения значения
function increaseAnswerCount() {
    const answerCountElement = document.getElementById("answer-count");
    if (answerCountElement) {
        let currentValue = parseInt(answerCountElement.textContent, 10);
        currentValue += 1;
        answerCountElement.textContent = currentValue;
    }
}

// Функция для уменьшения значения
function decreaseAnswerCount() {
    const answerCountElement = document.getElementById("answer-count");
    if (answerCountElement) {
        let currentValue = parseInt(answerCountElement.textContent, 10);
        if (currentValue > 0) {
            currentValue -= 1;
            answerCountElement.textContent = currentValue;
        }
    }
}

// Инициализация начального значения (0)
updateAnswerCount(0);

function toggleMenu() {
    let menu = document.getElementById("userMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Закрываем меню, если кликнули вне его
document.addEventListener("click", function (event) {
    let menu = document.getElementById("userMenu");
    let btn = document.querySelector(".user-btn");

    if (menu && btn && !btn.contains(event.target) && !menu.contains(event.target)) {
        menu.style.display = "none";
    }
});


function sendRegisterForm() {
    if (!validateRegister()) return; // Проверяем форму перед отправкой

    let formData = new FormData();
    formData.append("name", document.getElementById("name").value);
    formData.append("surname", document.getElementById("surname").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("password", document.getElementById("password").value);

    fetch("/register", {
        method: "POST",
        body: formData
    }).then(response => {
        if (response.redirected) {
            window.location.href = response.url; // Если редирект, переходим на главную
        } else {
            return response.text();
        }
    }).then(text => {
        if (text) alert(text); // Показываем ошибку, если есть
    }).catch(error => console.error("Ошибка запроса:", error));
}

