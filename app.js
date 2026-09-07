const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
let results=[],jumps=[];
const $=id=>document.getElementById(id);
const resultHistory=$("resultHistory"),jumpHistory=$("jumpHistory"),numberGrid=$("numberGrid"),detectedGrid=$("detectedGrid"),resultCount=$("resultCount"),jumpCount=$("jumpCount"),detectedCount=$("detectedCount"),frequencyList=$("frequencyList"),frequencyCount=$("frequencyCount"),undoResult=$("undoResult"),clearHistory=$("clearHistory");
function color(n){return n===0?"green":REDS.has(n)?"red":"black"}
function calculateJump(previous, current) {
  const previousIndex = WHEEL.indexOf(previous);
  const currentIndex = WHEEL.indexOf(current);

  if (previousIndex === -1 || currentIndex === -1) return null;

  let value = currentIndex - previousIndex;

  if (value > 18) value -= 37;
  if (value < -18) value += 37;

  return value;
}

function rebuildJumps() {
  const rebuilt = [];

  for (let i = 0; i < results.length - 1; i++) {
    const value = calculateJump(results[i + 1], results[i]);
    if (value !== null) rebuilt.push(value);
  }

  return rebuilt;
}

function renderNumbers(){numberGrid.innerHTML="";for(let n=0;n<=36;n++){let b=document.createElement("button");b.className=`number-btn ${color(n)}`;b.textContent=n;b.addEventListener("click",()=>{results.unshift(n);jumps=rebuildJumps();render()});numberGrid.appendChild(b)}}
function renderResults(){resultHistory.innerHTML="";if(!results.length){resultHistory.className="history empty";resultHistory.textContent="Pulsa un número para registrar el resultado"}else{resultHistory.className="history";results.forEach(n=>{let x=document.createElement("div");x.className=`history-number ${color(n)}`;x.textContent=n;resultHistory.appendChild(x)})}resultCount.textContent=`${results.length} ${results.length===1?"resultado":"resultados"}`;undoResult.disabled=!results.length}
function renderJumps(){jumpHistory.innerHTML="";if(!jumps.length){jumpHistory.className="jump-history empty";jumpHistory.textContent="Los saltos aparecerán aquí al registrar dos resultados"}else{jumpHistory.className="jump-history";jumps.forEach(j=>{let x=document.createElement("div");x.className=`jump-chip ${j>0?"positive":""}`;x.textContent=j>0?`+${j}`:j;jumpHistory.appendChild(x)})}jumpCount.textContent=`${jumps.length} ${jumps.length===1?"salto":"saltos"}`}
function renderDetected() {
  detectedGrid.innerHTML = "";

  const detected = new Set();
  jumps.forEach(value => {
    const magnitude = Math.abs(value);
    if (magnitude >= 1 && magnitude <= 18) detected.add(magnitude);
  });

  for (let n = 1; n <= 18; n++) {
    const cell = document.createElement("div");
    cell.className = "detected-cell";
    cell.textContent = `±${n}`;
    if (detected.has(n)) cell.classList.add("active");
    detectedGrid.appendChild(cell);
  }

  detectedCount.textContent = `${detected.size} / 18`;
}
function renderFrequency(){frequencyList.innerHTML="";if(!jumps.length){frequencyList.className="frequency-list empty";frequencyList.textContent="La frecuencia aparecerá aquí al registrar saltos";frequencyCount.textContent="0 saltos registrados";return}let m=new Map;jumps.forEach(j=>{let n=Math.abs(j);m.set(n,(m.get(n)||0)+1)});let a=[...m.entries()].sort((x,y)=>y[1]-x[1]||x[0]-y[0]),max=a[0][1];frequencyList.className="frequency-list";a.forEach(([n,c],i)=>{let r=document.createElement("div");r.className="frequency-row";r.innerHTML=`<div class="frequency-rank">#${i+1}</div><div class="frequency-jump">±${n}</div><div class="frequency-bar-wrap"><div class="frequency-bar" style="width:${c/max*100}%"></div></div><div class="frequency-value">${c}<span>${c===1?"vez":"veces"}</span></div>`;frequencyList.appendChild(r)});frequencyCount.textContent=`${jumps.length} ${jumps.length===1?"salto registrado":"saltos registrados"}`}
function renderReference() {
  referenceNumbers.innerHTML = "";

  if (!results.length || !jumps.length) {
    referenceJump.textContent = "Sin referencia";
    referenceNumbers.textContent = "Registra al menos dos resultados";
    return;
  }

  const counts = new Map();
  jumps.forEach(value => {
    const magnitude = Math.abs(value);
    counts.set(magnitude, (counts.get(magnitude) || 0) + 1);
  });

  const ordered = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0]);

  const magnitude = ordered[0][0];
  const current = results[0];
  const currentIndex = WHEEL.indexOf(current);

  const plus = WHEEL[(currentIndex + magnitude) % 37];
  const minus = WHEEL[(currentIndex - magnitude + 37) % 37];

  referenceJump.textContent = `±${magnitude} · nº 1`;

  const minusSign = document.createElement("span");
  minusSign.className = "reference-sign";
  minusSign.textContent = "−";

  const minusNumber = document.createElement("div");
  minusNumber.className = `reference-number ${color(minus)}`;
  minusNumber.textContent = minus;

  const arrow = document.createElement("span");
  arrow.className = "reference-arrow";
  arrow.textContent = `↔  ${current}  ↔`;

  const plusNumber = document.createElement("div");
  plusNumber.className = `reference-number ${color(plus)}`;
  plusNumber.textContent = plus;

  const plusSign = document.createElement("span");
  plusSign.className = "reference-sign";
  plusSign.textContent = "+";

  referenceNumbers.append(minusSign, minusNumber, arrow, plusNumber, plusSign);
} 

function render(){renderResults();renderJumps();renderDetected();renderFrequency();renderReference()}
undoResult.addEventListener("click",()=>{if(results.length){results.shift();jumps=rebuildJumps();render()}});
clearHistory.addEventListener("click",()=>{results=[];jumps=[];render()});
renderNumbers();render();
