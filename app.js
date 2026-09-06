/*
 * European Roulette Jumps
 * The wheel order is the real European roulette pocket order.
 *
 * Positive jump = clockwise according to this array.
 * Negative jump = counter-clockwise.
 *
 * Results are displayed newest first.
 */

const WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34,
  6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18,
  29, 7, 28, 12, 35, 3, 26
];

const resultsEl = document.getElementById("results");
const jumpsEl = document.getElementById("jumps");
const jumpGridEl = document.getElementById("jumpGrid");
const inputEl = document.getElementById("numberInput");
const addBtn = document.getElementById("addResult");
const clearBtn = document.getElementById("clearHistory");
const errorEl = document.getElementById("error");
const resultCountEl = document.getElementById("resultCount");
const jumpCountEl = document.getElementById("jumpCount");

let results = [];
let jumps = [];
const jumpCounts = new Map();

for (let i = 1; i <= 18; i++) jumpCounts.set(i, 0);

function positionOf(number) {
  return WHEEL.indexOf(number);
}

function calculateJump(previous, current) {
  const previousIndex = positionOf(previous);
  const currentIndex = positionOf(current);

  if (previousIndex < 0 || currentIndex < 0) {
    throw new Error("Resultado no válido.");
  }

  // Clockwise movement is forward through WHEEL.
  let clockwise = (currentIndex - previousIndex + WHEEL.length) % WHEEL.length;

  // Normalize to the signed shortest circular jump.
  if (clockwise > WHEEL.length / 2) {
    clockwise -= WHEEL.length;
  }

  return clockwise;
}

function renderJumpGrid() {
  jumpGridEl.innerHTML = "";

  for (let i = 1; i <= 18; i++) {
    const cell = document.createElement("div");
    cell.className = "jump-cell";

    if (jumpCounts.get(i) > 0) cell.classList.add("active");

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `±${i}`;

    const count = document.createElement("div");
    count.className = "count";
    count.textContent = `${jumpCounts.get(i)} ${jumpCounts.get(i) === 1 ? "vez" : "veces"}`;

    cell.append(label, count);
    jumpGridEl.appendChild(cell);
  }
}

function renderResults() {
  resultsEl.innerHTML = "";

  if (results.length === 0) {
    resultsEl.classList.add("empty");
    resultsEl.textContent = "Introduce el primer resultado";
  } else {
    resultsEl.classList.remove("empty");

    results.forEach((number, index) => {
      const item = document.createElement("div");
      item.className = "number";
      if (index === 0) item.classList.add("latest");
      item.textContent = number;
      resultsEl.appendChild(item);
    });
  }

  resultCountEl.textContent = `${results.length} ${results.length === 1 ? "tirada" : "tiradas"}`;
}

function renderJumps() {
  jumpsEl.innerHTML = "";

  if (jumps.length === 0) {
    jumpsEl.classList.add("empty");
    jumpsEl.textContent = "Los saltos aparecerán aquí";
  } else {
    jumpsEl.classList.remove("empty");

    jumps.forEach(jump => {
      const item = document.createElement("div");
      item.className = "jump";
      item.classList.add(jump >= 0 ? "positive" : "negative");
      item.textContent = jump > 0 ? `+${jump}` : `${jump}`;
      jumpsEl.appendChild(item);
    });
  }

  jumpCountEl.textContent = `${jumps.length} ${jumps.length === 1 ? "salto" : "saltos"}`;
}

function render() {
  renderResults();
  renderJumps();
  renderJumpGrid();
}

function showError(message) {
  errorEl.textContent = message;
}

function clearError() {
  errorEl.textContent = "";
}

function addResult() {
  const raw = inputEl.value.trim();

  if (raw === "") {
    showError("Introduce un número entre 0 y 36.");
    return;
  }

  const number = Number(raw);

  if (!Number.isInteger(number) || number < 0 || number > 36) {
    showError("El resultado debe ser un número entero entre 0 y 36.");
    return;
  }

  clearError();

  // The new result is inserted first because the newest result is displayed first.
  if (results.length > 0) {
    const jump = calculateJump(results[0], number);
    jumps.unshift(jump);
    jumpCounts.set(Math.abs(jump), jumpCounts.get(Math.abs(jump)) + 1);
  }

  results.unshift(number);
  inputEl.value = "";
  inputEl.focus();

  render();
}

function clearHistory() {
  results = [];
  jumps = [];
  for (let i = 1; i <= 18; i++) jumpCounts.set(i, 0);

  clearError();
  render();
  inputEl.focus();
}

addBtn.addEventListener("click", addResult);
clearBtn.addEventListener("click", clearHistory);

inputEl.addEventListener("keydown", event => {
  if (event.key === "Enter") addResult();
});

render();
