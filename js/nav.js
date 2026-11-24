/* Загальний скрипт керує мобільним меню, поточним пунктом і підвалом усіх сторінок. */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("hidden", !open);
    });
  }

  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.getAttribute("href") === location.pathname.split("/").pop()) {
      link.setAttribute("aria-current", "page");
    }
  });

  const footer = document.querySelector("[data-footer]");
  if (footer) {
    const year = document.createElement("p");
    year.textContent = `© ${new Date().getFullYear()} «Зелений вибір». Навчальний екопроєкт.`;
    year.className = "text-sm";
    footer.append(year);
  }
});
