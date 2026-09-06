const WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13,
  36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
  31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const REDS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19,
  21, 23, 25, 27, 30, 32, 34, 36
]);

let results = [];
let jumps = [];

const $ = id => document.getElementById(id);

const resultHistory = $("resultHistory");
const jumpHistory = $("jumpHistory");
const numberGrid = $("numberGrid");
const detectedGrid = $("detectedGrid");
const resultCount = $("resultCount");
const jumpCount = $("jumpCount");
const detectedCount = $("detectedCount");
const undoResult = $("undoResult");
const clearHistory = $("clearHistory");

function colorClass(number) {
  if (number === 0) return "green";
  return REDS.has(number) ? "red" : "black";
}

function calculateJump(previous, current) {
  const from = WHEEL.indexOf(previous);
  const to = WHEEL.indexOf(current);

  let jump = to - from;

  if (jump > 18) jump -= 37;
  if (jump < -18) jump += 37;

  return jump;
}

function buildJumps() {
  const calculated = [];

  for (let i = 0; i < results.length - 1; i++) {
    calculated.push(calculateJump(results[i + 1], results[i]));
  }

  return calculated;
}

function renderNumberGrid() {
  numberGrid.innerHTML = "";

  for (let number = 0; number <= 36; number++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `number-btn ${colorClass(number)}`;
    button.textContent = number;
    button.setAttribute("aria-label", `Registrar ${number}`);
    button.addEventListener("click", () => registerResult(number));
    numberGrid.appendChild(button);
  }
}

function renderResults() {
  resultHistory.innerHTML = "";

  if (!results.length) {
    resultHistory.className = "result-history empty";
    const text = document.createElement("span");
    text.textContent = "Pulsa un número para registrar el resultado";
    resultHistory.appendChild(text);
  } else {
    resultHistory.className = "result-history";

    results.forEach(number => {
      const chip = document.createElement("div");
      chip.className = `history-number ${colorClass(number)}`;
      chip.textContent = number;
      resultHistory.appendChild(chip);
    });
  }

  resultCount.textContent =
    `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`;

  undoResult.disabled = results.length === 0;
}

function renderJumps() {
  jumpHistory.innerHTML = "";

  if (!jumps.length) {
    jumpHistory.className = "jump-history empty";
    const text = document.createElement("span");
    text.textContent = "Los saltos aparecerán aquí al registrar dos resultados";
    jumpHistory.appendChild(text);
  } else {
    jumpHistory.className = "jump-history";

    jumps.forEach(jump => {
      const chip = document.createElement("div");
      chip.className = `jump-chip ${jump > 0 ? "positive" : jump < 0 ? "negative" : ""}`;
      chip.textContent = jump > 0 ? `+${jump}` : jump;
      jumpHistory.appendChild(chip);
    });
  }

  jumpCount.textContent =
    `${jumps.length} ${jumps.length === 1 ? "salto" : "saltos"}`;
}

function renderDetected() {
  detectedGrid.innerHTML = "";

  const detected = new Set(jumps.map(jump => Math.abs(jump)));

  for (let magnitude = 1; magnitude <= 18; magnitude++) {
    const cell = document.createElement("div");
    cell.className = "detected-cell";
    cell.textContent = `±${magnitude}`;

    if (detected.has(magnitude)) {
      cell.classList.add("active");
    }

    detectedGrid.appendChild(cell);
  }

  detectedCount.textContent = `${detected.size} / 18`;
}

function render() {
  renderResults();
  renderJumps();
  renderDetected();
}

function registerResult(number) {
  results.unshift(number);
  jumps = buildJumps();
  render();
}

function undoLastResult() {
  if (!results.length) return;

  results.shift();
  jumps = buildJumps();
  render();
}

function clearAll() {
  results = [];
  jumps = [];
  render();
}

undoResult.addEventListener("click", undoLastResult);
clearHistory.addEventListener("click", clearAll);

renderNumberGrid();
render();
