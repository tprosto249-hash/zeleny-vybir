/* Цей модуль одразу визначає тему до завантаження сторінки, щоб уникнути миготіння світлого інтерфейсу. */
(function () {
  const saved = localStorage.getItem("zv-theme");
  const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
})();

/* Після завантаження DOM підключаємо кнопку перемикання теми і оновлюємо її доступний стан. */
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  if (!button) return;

  const syncTheme = () => {
    const dark = document.documentElement.classList.contains("dark");
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Увімкнути світлу тему" : "Увімкнути темну тему");
    if (icon) icon.textContent = dark ? "☀" : "☾";
  };

  button.addEventListener("click", () => {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("zv-theme", dark ? "dark" : "light");
    syncTheme();
  });
  syncTheme();
});
