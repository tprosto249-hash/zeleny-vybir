/* Довідник сортування завантажує дані асинхронно й рендерить картки через DOM. */
let wasteItems = [];
const categoryNames = { all:"Усі", plastic:"Пластик", paper:"Папір", glass:"Скло", metal:"Метал", organic:"Органіка", dangerous:"Небезпечні", electronics:"Електроніка", reuse:"Повторне використання" };

async function loadWasteItems() {
  const grid = document.getElementById("waste-grid");
  const loader = document.getElementById("sorting-loader");
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    wasteItems = data.wasteItems;
    buildFilters();
    renderItems(wasteItems);
  } catch (error) {
    grid.replaceChildren(createError("Не вдалося завантажити довідник. Перевірте підключення до data/data.json."));
  } finally {
    loader.hidden = true;
  }
}

function createError(text) {
  const box = document.createElement("p");
  box.setAttribute("role", "alert");
  box.className = "col-span-full rounded-xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200";
  box.textContent = text;
  return box;
}

function buildFilters() {
  const filter = document.getElementById("category-filter");
  if (!filter) return;
  filter.replaceChildren();
  ["all", "plastic", "paper", "glass", "metal", "organic", "dangerous", "electronics", "reuse"].forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = categoryNames[key];
    filter.append(option);
  });
}

function renderItems(items) {
  const grid = document.getElementById("waste-grid");
  grid.replaceChildren();
  if (!items.length) {
    grid.append(createError("Нічого не знайдено. Спробуйте інший запит або категорію."));
    return;
  }
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "rounded-2xl border border-eco-100 bg-white p-5 shadow-sm dark:border-eco-800 dark:bg-eco-900";
    const top = document.createElement("div");
    top.className = "flex items-center justify-between gap-3";
    const title = document.createElement("h2");
    title.className = "text-lg font-bold text-eco-950 dark:text-white";
    title.textContent = item.name;
    const badge = document.createElement("span");
    badge.className = "rounded-full bg-eco-100 px-3 py-1 text-xs font-bold text-eco-800 dark:bg-eco-800 dark:text-eco-50";
    badge.textContent = categoryNames[item.category] || item.category;
    top.append(title, badge);
    const fields = [
      ["Куди викидати", item.where],
      ["Як підготувати", item.prepare],
      ["Корисна порада", item.tip]
    ];
    card.append(top);
    fields.forEach(([label, text]) => {
      const block = document.createElement("div");
      block.className = "mt-4";
      const h = document.createElement("h3");
      h.className = "text-sm font-bold text-eco-800 dark:text-eco-100";
      h.textContent = label;
      const p = document.createElement("p");
      p.className = "mt-1 text-sm text-eco-700 dark:text-eco-200";
      p.textContent = text;
      block.append(h, p);
      card.append(block);
    });
    const recyclable = document.createElement("p");
    recyclable.className = `mt-4 text-sm font-bold ${item.recyclable ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`;
    recyclable.textContent = item.recyclable ? "✓ Можна переробити або передати" : "× Потребує окремої утилізації";
    card.append(recyclable);
    grid.append(card);
  });
}

function applyFilters() {
  const query = document.getElementById("waste-search").value.trim().toLocaleLowerCase("uk");
  const category = document.getElementById("category-filter").value;
  const filtered = wasteItems.filter((item) =>
    (category === "all" || item.category === category) &&
    `${item.name} ${item.where} ${item.prepare}`.toLocaleLowerCase("uk").includes(query)
  );
  renderItems(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("waste-search").addEventListener("input", applyFilters);
  document.getElementById("category-filter").addEventListener("change", applyFilters);
  loadWasteItems();
});
