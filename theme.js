const themeButton =
document.getElementById(
"theme-toggle"
);

const THEME_KEY =
"ginsen-theme";

function loadTheme(){

    const savedTheme =
    localStorage.getItem(
    THEME_KEY
    );

    if(savedTheme === "dark"){

        document.body.classList.add(
        "dark-mode"
        );

        themeButton.textContent =
        "☀️";
    }
}

function toggleTheme(){

    document.body.classList.toggle(
    "dark-mode"
    );

    const dark =
    document.body.classList.contains(
    "dark-mode"
    );

    themeButton.textContent =
    dark
    ? "☀️"
    : "🌙";

    localStorage.setItem(
    THEME_KEY,
    dark
    ? "dark"
    : "light"
    );
}

themeButton.addEventListener(
"click",
toggleTheme
);

loadTheme();