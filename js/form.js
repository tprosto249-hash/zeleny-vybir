/* Форма перевіряє дані на клієнті, маскує телефон і показує доступне модальне вікно успіху. */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const phone = document.getElementById("phone");
  phone.addEventListener("input", () => {
    const digits = phone.value.replace(/\D/g, "").slice(0, 12);
    let normalized = digits;
    if (!normalized.startsWith("380") && normalized.startsWith("0")) normalized = "380" + normalized.slice(1);
    if (!normalized.startsWith("380")) normalized = "380" + normalized.replace(/^38?0?/, "");
    normalized = normalized.slice(0, 12);
    let result = "+";
    if (normalized.length) result += normalized.slice(0, 3);
    if (normalized.length > 3) result += " " + normalized.slice(3, 5);
    if (normalized.length > 5) result += " " + normalized.slice(5, 8);
    if (normalized.length > 8) result += " " + normalized.slice(8, 10);
    if (normalized.length > 10) result += " " + normalized.slice(10, 12);
    phone.value = result.trim();
  });

  const validators = {
    name: (value) => /^[А-ЩЬЮЯЄІЇҐа-щьюяєіїґ'’ -]{2,50}$/u.test(value.trim()) || "Введіть ім’я літерними символами (від 2 до 50).",
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(value.trim()) || "Введіть коректну адресу email.",
    phone: (value) => /^\+380 \d{2} \d{3} \d{2} \d{2}$/u.test(value.trim()) || "Формат телефону: +380 XX XXX XX XX.",
    topic: (value) => value !== "" || "Оберіть тему повідомлення.",
    message: (value) => value.trim().length >= 10 || "Повідомлення має містити щонайменше 10 символів."
  };

  function validateField(field) {
    const error = document.getElementById(`${field.id}-error`);
    const result = validators[field.id](field.value);
    const valid = result === true;
    field.setAttribute("aria-invalid", String(!valid));
    error.textContent = valid ? "" : result;
    return valid;
  }

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll("input, select, textarea")];
    const valid = fields.every(validateField);
    if (!valid) {
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    const submit = document.getElementById("submit-button");
    submit.disabled = true;
    submit.textContent = "Надіслано";
    openModal();
  });

  const modal = document.getElementById("success-modal");
  let previousFocus = null;
  function openModal() {
    previousFocus = document.activeElement;
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    modal.querySelector("button").focus();
  }
  function closeModal() {
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    if (previousFocus) previousFocus.focus();
  }
  modal.querySelector("[data-modal-close]").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", (event) => {
    if (modal.classList.contains("hidden")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      const focusable = [...modal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});
