// Find Your Printer quiz: 4 questions -> score the catalog -> show top 3.
// Scoring ported 1:1 from the Next.js prototype's score() function in
// src/components/sections/find-your-printer-section.tsx.

function scorePrinter(product, answers) {
  let s = 0;
  if (answers.useCase && (product.useCases || []).includes(answers.useCase)) s += 4;
  if (answers.experience && (product.experienceLevel || []).includes(answers.experience)) s += 3;
  if (answers.budgetMax !== null) {
    if (product.price <= answers.budgetMax) s += 3;
    else if (product.price <= answers.budgetMax * 1.2) s += 1;
    else s -= 2;
  }
  switch (answers.priority) {
    case "Speed":
      if ((product.speedMmPerSec || 0) >= 400) s += 3;
      break;
    case "Large build volume":
      if ((product.buildVolumeCc || 0) > 10_000_000) s += 3;
      break;
    case "Ease of use":
      if ((product.experienceLevel || []).includes("Beginner")) s += 3;
      break;
    case "Materials":
      if ((product.materialsCount || 0) >= 4) s += 3;
      break;
    case "Reliability":
      if ((product.rating || 0) >= 4.7) s += 3;
      break;
    case "Price":
      s += Math.max(0, 3 - product.price / 100000);
      break;
    case "Quality":
      if ((product.technology || []).includes("Resin") || (product.rating || 0) >= 4.7) s += 3;
      break;
  }
  return s;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector(".js-fyp");
  if (!root) return;

  const printers = Array.isArray(window.infillpkPrinters) ? window.infillpkPrinters : [];
  const steps = root.querySelectorAll(".js-fyp-step");
  const progressBars = root.querySelectorAll(".js-fyp-progress-bar");
  const backBtn = root.querySelector(".js-fyp-back");
  const progressWrap = root.querySelector(".js-fyp-progress");
  const resultsWrap = root.querySelector(".js-fyp-results");
  const resultsGrid = root.querySelector(".js-fyp-results-grid");
  const noResults = root.querySelector(".js-fyp-no-results");
  const restartBtn = root.querySelector(".js-fyp-restart");

  const answers = { useCase: null, experience: null, priority: null, budgetMax: null };
  let step = 0;

  function render() {
    steps.forEach((el) => el.classList.toggle("hidden", Number(el.dataset.step) !== step));
    progressBars.forEach((el) => el.classList.toggle("bg-blue-700", Number(el.dataset.index) <= step));
    progressBars.forEach((el) => el.classList.toggle("bg-border", Number(el.dataset.index) > step));
    backBtn.classList.toggle("hidden", step === 0);

    const done = step >= 4;
    progressWrap.classList.toggle("hidden", done);
    steps.forEach((el) => {
      if (done) el.classList.add("hidden");
    });
    backBtn.classList.toggle("hidden", done || step === 0);
    resultsWrap.classList.toggle("hidden", !done);

    if (done) showResults();
  }

  function showResults() {
    const scored = printers
      .map((p) => ({ p, s: scorePrinter(p, answers) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);

    resultsGrid.innerHTML = "";
    noResults.classList.toggle("hidden", scored.length > 0);

    for (const { p } of scored) {
      const card = document.createElement("a");
      card.href = p.url;
      card.className =
        "focus-ring group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-blue-300";
      card.innerHTML = `
        <div class="aspect-square overflow-hidden bg-surface-sunken">
          <img src="${p.image}" alt="" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
        </div>
        <div class="p-4">
          <h4 class="font-display text-sm font-semibold text-ink group-hover:text-blue-700">${p.name}</h4>
          <p class="mt-1 text-sm text-ink-muted">${p.priceHtml}</p>
        </div>`;
      resultsGrid.appendChild(card);
    }
  }

  root.addEventListener("click", (event) => {
    const choice = event.target.closest(".js-fyp-choice");
    if (choice) {
      const question = choice.dataset.question;
      const raw = choice.dataset.value;
      answers[question] = raw === "Infinity" ? Infinity : isNaN(Number(raw)) ? raw : Number(raw);
      step = Math.min(4, step + 1);
      render();
      return;
    }

    if (event.target.closest(".js-fyp-back")) {
      step = Math.max(0, step - 1);
      render();
      return;
    }

    if (event.target.closest(".js-fyp-restart")) {
      answers.useCase = answers.experience = answers.priority = answers.budgetMax = null;
      step = 0;
      render();
    }
  });

  render();
});
