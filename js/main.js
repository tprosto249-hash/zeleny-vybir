/* Головна сторінка завантажує поради та відгуки з data.json і будує карусель. */
const $ = (selector, root = document) => root.querySelector(selector);

async function loadHomeData() {
  const loader = $("#home-loader");
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderSwiper(data.reviews, data.tips);
  } catch (error) {
    if (loader) loader.replaceChildren(createNotice("Не вдалося завантажити поради. Запустіть сайт через локальний сервер."));
  } finally {
    if (loader) loader.hidden = true;
  }
}

function createNotice(text) {
  const p = document.createElement("p");
  p.className = "rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200";
  p.setAttribute("role", "alert");
  p.textContent = text;
  return p;
}

function renderSwiper(reviews, tips) {
  const wrapper = $("#swiper-wrapper");
  if (!wrapper) return;
  [...reviews, ...tips.map((tip) => ({ title: tip.title, text: tip.text, author: "Порада" }))].forEach((item) => {
    const slide = document.createElement("article");
    slide.className = "swiper-slide rounded-2xl border border-eco-100 bg-white p-6 shadow-sm dark:border-eco-800 dark:bg-eco-900";
    const title = document.createElement("h3");
    title.className = "text-xl font-bold text-eco-900 dark:text-white";
    title.textContent = item.title;
    const text = document.createElement("p");
    text.className = "mt-3 text-eco-700 dark:text-eco-100";
    text.textContent = item.text;
    const author = document.createElement("p");
    author.className = "mt-5 text-sm font-semibold text-eco-600";
    author.textContent = item.author;
    slide.append(title, text, author);
    wrapper.append(slide);
  });
  if (window.Swiper) {
    new Swiper(".eco-swiper", { loop: true, slidesPerView: 1, spaceBetween: 16, autoplay: { delay: 5000 }, pagination: { el: ".swiper-pagination", clickable: true }, breakpoints: { 768: { slidesPerView: 2 } } });
  }
}

/* Анімований еколічильник уважно перевіряє преференцію зменшення руху. */
function animateCounters() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const counters = document.querySelectorAll("[data-counter]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        current = Math.min(target, current + step);
        el.textContent = current.toLocaleString("uk-UA");
        if (current >= target) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: .5 });
  counters.forEach((counter) => observer.observe(counter));
}

document.addEventListener("DOMContentLoaded", () => {
  loadHomeData();
  animateCounters();
});
