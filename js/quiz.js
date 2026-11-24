/* Інтерактивний тест підтримує прогрес, підрахунок балів і збереження останнього результату. */
let questions = [];
let index = 0;
let score = 0;

async function loadQuiz() {
  try {
    const response = await fetch("data/data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    questions = data.quizQuestions;
    renderQuestion();
  } catch (error) {
    document.getElementById("quiz-app").replaceChildren(createQuizError());
  }
}

function createQuizError() {
  const p = document.createElement("p");
  p.setAttribute("role", "alert");
  p.className = "rounded-xl border border-red-200 bg-red-50 p-5 text-red-800";
  p.textContent = "Не вдалося завантажити запитання. Запустіть сторінку через локальний сервер.";
  return p;
}

function renderQuestion() {
  const app = document.getElementById("quiz-app");
  app.replaceChildren();
  if (index >= questions.length) return showResult();

  const q = questions[index];
  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.className = "text-xl font-bold text-eco-950 dark:text-white";
  legend.textContent = q.question;
  fieldset.append(legend);

  q.options.forEach((option, optionIndex) => {
    const label = document.createElement("label");
    label.className = "mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-eco-200 p-4 hover:border-eco-500 dark:border-eco-700";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.value = String(option.points);
    radio.id = `answer-${optionIndex}`;
    radio.className = "mt-1 h-4 w-4 accent-eco-600";
    const text = document.createElement("span");
    text.textContent = option.text;
    label.append(radio, text);
    fieldset.append(label);
  });

  const next = document.createElement("button");
  next.type = "button";
  next.className = "mt-6 rounded-xl bg-eco-600 px-5 py-3 font-bold text-white hover:bg-eco-700";
  next.textContent = index === questions.length - 1 ? "Показати результат" : "Далі";
  next.addEventListener("click", () => {
    const checked = app.querySelector("input[name='answer']:checked");
    if (!checked) {
      document.getElementById("quiz-error").textContent = "Оберіть один варіант відповіді.";
      return;
    }
    document.getElementById("quiz-error").textContent = "";
    score += Number(checked.value);
    index += 1;
    updateProgress();
    renderQuestion();
  });
  app.append(fieldset, next);
  updateProgress();
}

function updateProgress() {
  const percent = (index / questions.length) * 100;
  const progress = document.getElementById("quiz-progress");
  progress.value = percent;
  progress.textContent = `${Math.round(percent)}%`;
  document.getElementById("progress-text").textContent = `Питання ${Math.min(index + 1, questions.length)} з ${questions.length}`;
}

function showResult() {
  const max = questions.length * 2;
  const percent = max ? (score / max) * 100 : 0;
  let title, advice;
  if (percent < 34) {
    title = "Початківець";
    advice = "Обирайте одну просту звичку на тиждень: сортування, коротша витрата води або власна сумка.";
  } else if (percent < 67) {
    title = "Свідомий споживач";
    advice = "Підсиліть успіх: плануйте покупки, ремонтуйте речі та сортуйте всі доступні фракції.";
  } else {
    title = "Еко-чемпіон";
    advice = "Розширюйте вплив: обмінюйтеся знаннями, підтримуйте ремонт і залучайте спільноту.";
  }
  localStorage.setItem("zv-last-quiz", JSON.stringify({ title, score, max, percent: Math.round(percent), date: new Date().toISOString() }));
  const progress = document.getElementById("quiz-progress");
  progress.value = 100;
  progress.textContent = "100%";
  document.getElementById("progress-text").textContent = "Тест завершено";
  const app = document.getElementById("quiz-app");
  app.replaceChildren();
  const card = document.createElement("article");
  card.className = "rounded-2xl border border-eco-200 bg-eco-50 p-6 text-center dark:border-eco-700 dark:bg-eco-950";
  const h = document.createElement("h2");
  h.className = "text-3xl font-black text-eco-800 dark:text-eco-100";
  h.textContent = title;
  const p = document.createElement("p");
  p.className = "mt-3 text-eco-700 dark:text-eco-200";
  p.textContent = `${advice} Результат: ${score} з ${max} балів.`;
  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "mt-5 rounded-xl bg-eco-600 px-5 py-3 font-bold text-white";
  reset.textContent = "Пройти ще раз";
  reset.addEventListener("click", () => { index = 0; score = 0; renderQuestion(); });
  card.append(h, p, reset);
  app.append(card);
}

document.addEventListener("DOMContentLoaded", loadQuiz);
