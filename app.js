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
const detected = new Set();

const resultHistory = document.getElementById("resultHistory");
const jumpHistory = document.getElementById("jumpHistory");
const numberGrid = document.getElementById("numberGrid");
const detectedGrid = document.getElementById("detectedGrid");
const resultCount = document.getElementById("resultCount");
const jumpCount = document.getElementById("jumpCount");
const clearHistory = document.getElementById("clearHistory");

function colorClass(n) {
  if (n === 0) return "green";
  return REDS.has(n) ? "red" : "black";
}

function calculateJump(previous, current) {
  const previousIndex = WHEEL.indexOf(previous);
  const currentIndex = WHEEL.indexOf(current);

  let jump = currentIndex - previousIndex;
  if (jump > 18) jump -= 37;
  if (jump < -18) jump += 37;

  return jump;
}

function renderNumberGrid() {
  numberGrid.innerHTML = "";

  for (let n = 0; n <= 36; n++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `number-btn ${colorClass(n)}`;
    button.textContent = n;
    button.setAttribute("aria-label", `Registrar resultado ${n}`);
    button.addEventListener("click", () => registerResult(n));
    numberGrid.appendChild(button);
  }
}

function renderResults() {
  resultHistory.innerHTML = "";

  if (results.length === 0) {
    resultHistory.className = "result-history empty";
    const message = document.createElement("span");
    message.textContent = "Selecciona el número que acaba de salir";
    resultHistory.appendChild(message);
  } else {
    resultHistory.className = "result-history";
    results.forEach(n => {
      const chip = document.createElement("div");
      chip.className = `history-number ${colorClass(n)}`;
      chip.textContent = n;
      resultHistory.appendChild(chip);
    });
  }

  resultCount.textContent = `${results.length} ${results.length === 1 ? "resultado" : "resultados"}`;
}

function renderJumps() {
  jumpHistory.innerHTML = "";

  if (jumps.length === 0) {
    jumpHistory.className = "jump-history empty";
    const message = document.createElement("span");
    message.textContent = "Los saltos aparecerán aquí";
    jumpHistory.appendChild(message);
  } else {
    jumpHistory.className = "jump-history";
    jumps.forEach(jump => {
      const chip = document.createElement("div");
      chip.className = `jump-chip ${jump > 0 ? "positive" : jump < 0 ? "negative" : ""}`;
      chip.textContent = jump > 0 ? `+${jump}` : `${jump}`;
      jumpHistory.appendChild(chip);
    });
  }

  jumpCount.textContent = `${jumps.length} ${jumps.length === 1 ? "salto" : "saltos"}`;
}

function renderDetected() {
  detectedGrid.innerHTML = "";

  for (let magnitude = 1; magnitude <= 18; magnitude++) {
    const cell = document.createElement("div");
    cell.className = "detected-cell";
    if (detected.has(magnitude)) cell.classList.add("active");
    cell.textContent = `±${magnitude}`;
    detectedGrid.appendChild(cell);
  }
}

function registerResult(number) {
  if (results.length > 0) {
    const previous = results[0];
    const jump = calculateJump(previous, number);
    jumps.unshift(jump);
    detected.add(Math.abs(jump));
  }

  results.unshift(number);
  renderResults();
  renderJumps();
  renderDetected();
}

function resetAll() {
  results = [];
  jumps = [];
  detected.clear();
  renderResults();
  renderJumps();
  renderDetected();
}

clearHistory.addEventListener("click", resetAll);

renderNumberGrid();
renderResults();
renderJumps();
renderDetected();
