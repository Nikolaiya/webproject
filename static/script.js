function openLogin() {
    closeAll();
    document.getElementById("overlay").classList.add("active");
    document.getElementById("loginModal").classList.add("active");
}

function openRegister() {
    closeAll();
    document.getElementById("overlay").classList.add("active");
    document.getElementById("registerModal").classList.add("active");
}

function closeAll() {
    document.getElementById("overlay").classList.remove("active");
    document.getElementById("loginModal").classList.remove("active");
    document.getElementById("registerModal").classList.remove("active");
}

document.getElementById("birthdate").addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "").slice(0, 8); // Оставляем только цифры
    if (value.length >= 2) value = value.slice(0, 2) + "." + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + "." + value.slice(5);

    e.target.value = value;
});

function validateRegister() {
    let birthdate = document.getElementById("birthdate");
    let warningIcon = document.getElementById("date-warning");

    let parts = birthdate.value.split(".");
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);

    let isValid = parts.length === 3
        && !isNaN(day) && !isNaN(month) && !isNaN(year)
        && day > 0 && day <= 31
        && month > 0 && month <= 12
        && year >= 1925 && year <= 2011;

    if (!isValid) {
        birthdate.classList.add("error-input");
        warningIcon.style.display = "flex";
    } else {
        birthdate.classList.remove("error-input");
        warningIcon.style.display = "none";
    }
}




