/* Калькулятор екочекліста перевіряє введення й рахує економію у реальному часі. */
let habits = [];
const categoryLabels = { water:"Вода", energy:"Енергія", waste:"Відходи", transport:"Транспорт", food:"Харчування" };
const categoryColors = { water:"#0ea5e9", energy:"#f59e0b", waste:"#22c55e", transport:"#8b5cf6", food:"#ef6c36" };
const frequencyMultiplier = { daily:365, weekly:52, monthly:12 };

async function loadHabits() {
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    habits = data.habits;
    renderHabits();
  } catch (error) {
    document.getElementById("habits-grid").replaceChildren(createMessage("Не вдалося завантажити коефіцієнти звичок."));
  }
}

function createMessage(text, type = "error") {
  const p = document.createElement("p");
  p.setAttribute("role", "alert");
  p.className = type === "error"
    ? "rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
    : "rounded-xl border border-eco-200 bg-eco-50 p-4 text-eco-800";
  p.textContent = text;
  return p;
}

function renderHabits() {
  const grid = document.getElementById("habits-grid");
  grid.replaceChildren();
  Object.keys(categoryLabels).forEach((category) => {
    const section = document.createElement("section");
    section.className = "rounded-2xl border border-eco-100 p-4 dark:border-eco-800";
    const h3 = document.createElement("h3");
    h3.className = "font-bold text-eco-900 dark:text-white";
    h3.textContent = categoryLabels[category];
    section.append(h3);
    habits.filter((habit) => habit.category === category).forEach((habit) => {
      const label = document.createElement("label");
      label.className = "mt-3 flex cursor-pointer items-start gap-3 text-sm";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = habit.id;
      input.name = "habit";
      input.value = habit.id;
      input.dataset.category = category;
      input.className = "mt-0.5 h-4 w-4 accent-eco-600";
      const text = document.createElement("span");
      text.textContent = habit.name;
      label.append(input, text);
      section.append(label);
    });
    grid.append(section);
  });
  grid.addEventListener("change", calculate);
  calculate();
}

function validatePeople() {
  const input = document.getElementById("people");
  const raw = input.value.trim();
  input.setAttribute("aria-invalid", "false");
  if (!raw) return { ok:false, message:"Вкажіть кількість людей у домогосподарстві." };
  if (!/^\d+$/.test(raw)) return { ok:false, message:"Кількість людей має містити лише цифри." };
  const people = Number(raw);
  if (people < 1 || people > 10) return { ok:false, message:"Кількість людей має бути від 1 до 10." };
  return { ok:true, people };
}

function calculate() {
  const peopleResult = validatePeople();
  const message = document.getElementById("checklist-error");
  const selected = [...document.querySelectorAll("input[name='habit']:checked")];
  if (!peopleResult.ok) {
    message.textContent = peopleResult.message;
  } else if (!selected.length) {
    message.textContent = "Оберіть хоча б одну екозвичку для розрахунку.";
  } else {
    message.textContent = "";
  }
  if (!peopleResult.ok || !selected.length) {
    setOutputs(0, 0, 0, {}, 0);
    return;
  }

  const people = peopleResult.people;
  let co2 = 0, water = 0, money = 0;
  const categoryTotals = { water:0, energy:0, waste:0, transport:0, food:0 };
  selected.forEach((input) => {
    const habit = habits.find((item) => item.id === input.value);
    if (!habit) return;
    const multiplier = frequencyMultiplier[habit.frequency] || 1;
    const shared = ["water","food","waste"].includes(habit.category) ? people : 1;
    co2 += habit.co2 * multiplier * shared;
    water += habit.water * multiplier * shared;
    money += habit.money * multiplier * shared;
    categoryTotals[habit.category] += habit.co2 * multiplier * shared;
  });
  const ecoLevel = Math.min(100, Math.round(selected.length / 15 * 100));
  setOutputs(co2, water, money, categoryTotals, ecoLevel);
}

function setOutputs(co2, water, money, categoryTotals, ecoLevel) {
  document.getElementById("co2-output").textContent = co2.toLocaleString("uk-UA", { maximumFractionDigits: 1 });
  document.getElementById("water-output").textContent = water.toLocaleString("uk-UA", { maximumFractionDigits: 0 });
  document.getElementById("money-output").textContent = money.toLocaleString("uk-UA", { maximumFractionDigits: 0 });
  const progress = document.getElementById("eco-progress");
  progress.value = ecoLevel;
  progress.textContent = `${ecoLevel}%`;
  document.getElementById("eco-level").textContent = `${ecoLevel}%`;
  renderChart(categoryTotals);
}

function renderChart(totals) {
  const chart = document.getElementById("eco-chart");
  chart.replaceChildren();
  const max = Math.max(1, ...Object.values(totals));
  Object.entries(totals).forEach(([category, value]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "flex h-40 flex-1 flex-col items-center justify-end";
    const bar = document.createElement("div");
    bar.className = "category-bar w-full";
    bar.style.height = `${Math.max(0, (value / max) * 128)}px`;
    bar.style.background = categoryColors[category];
    bar.title = `${categoryLabels[category]}: ${value.toFixed(1)} кг CO₂/рік`;
    const label = document.createElement("span");
    label.className = "mt-2 text-xs text-eco-700 dark:text-eco-200";
    label.textContent = categoryLabels[category];
    wrapper.append(bar, label);
    chart.append(wrapper);
  });
}

function resetChecklist() {
  document.querySelectorAll("input[name='habit']").forEach((input) => { input.checked = false; });
  document.getElementById("people").value = "1";
  document.getElementById("save-state").textContent = "";
  calculate();
}

function saveChecklist() {
  const peopleResult = validatePeople();
  const selected = [...document.querySelectorAll("input[name='habit']:checked")].map((input) => input.value);
  if (!peopleResult.ok || !selected.length) {
    calculate();
    document.getElementById("save-state").textContent = "Неможливо зберегти: перевірте поля та оберіть звичку.";
    return;
  }
  localStorage.setItem("zv-checklist", JSON.stringify({ people: peopleResult.people, selected }));
  document.getElementById("save-state").textContent = "Чекліст збережено на цьому пристрої.";
}

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem("zv-checklist"));
    if (!saved) return;
    if (Number.isInteger(saved.people) && saved.people >= 1 && saved.people <= 10) document.getElementById("people").value = String(saved.people);
    if (Array.isArray(saved.selected)) saved.selected.forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.checked = true;
    });
  } catch (error) {
    localStorage.removeItem("zv-checklist");
  }
}

async function copySummary() {
  const summary = `Зелений вибір: економія CO₂ — ${document.getElementById("co2-output").textContent} кг/рік; вода — ${document.getElementById("water-output").textContent} л/рік; гроші — ${document.getElementById("money-output").textContent} грн/рік.`;
  try {
    await navigator.clipboard.writeText(summary);
    document.getElementById("copy-state").textContent = "Підсумок скопійовано.";
  } catch (error) {
    document.getElementById("copy-state").textContent = "Копіювання недоступне у цьому браузері.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("people").addEventListener("input", calculate);
  document.getElementById("reset-checklist").addEventListener("click", resetChecklist);
  document.getElementById("save-checklist").addEventListener("click", saveChecklist);
  document.getElementById("print-checklist").addEventListener("click", () => window.print());
  document.getElementById("copy-summary").addEventListener("click", copySummary);
  loadHabits().then(loadSaved).then(calculate);
});
