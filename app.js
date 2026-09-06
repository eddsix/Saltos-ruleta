/*
 * European Roulette Jumps v2
 * European wheel order:
 * 0 → 32 → 15 → 19 → 4 → 21 → 2 → 25 → 17 → 34 → 6 → 27 →
 * 13 → 36 → 11 → 30 → 8 → 23 → 10 → 5 → 24 → 16 → 33 → 1 →
 * 20 → 14 → 31 → 9 → 22 → 18 → 29 → 7 → 28 → 12 → 35 → 3 → 26
 *
 * Forward through this wheel is positive.
 * Results are displayed newest first.
 */

const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

const resultsEl=document.getElementById("results");
const jumpsEl=document.getElementById("jumps");
const jumpGridEl=document.getElementById("jumpGrid");
const numberGridEl=document.getElementById("numberGrid");
const clearBtn=document.getElementById("clearHistory");
const resultCountEl=document.getElementById("resultCount");
const jumpCountEl=document.getElementById("jumpCount");

let results=[];
let jumps=[];
const jumpCounts=new Map();
for(let i=1;i<=18;i++) jumpCounts.set(i,0);

function positionOf(n){return WHEEL.indexOf(n)}

function calculateJump(previous,current){
  const a=positionOf(previous), b=positionOf(current);
  if(a<0||b<0) throw new Error("Resultado no válido");
  let jump=(b-a+WHEEL.length)%WHEEL.length;
  if(jump>WHEEL.length/2) jump-=WHEEL.length;
  return jump;
}

function buildNumberButtons(){
  numberGridEl.innerHTML="";
  for(let n=0;n<=36;n++){
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="number-btn";
    if(n===0) btn.classList.add("zero");
    btn.textContent=n;
    btn.setAttribute("aria-label",`Resultado ${n}`);
    btn.addEventListener("click",()=>addResult(n));
    numberGridEl.appendChild(btn);
  }
}

function renderResults(){
  resultsEl.innerHTML="";
  if(!results.length){
    resultsEl.className="results empty";
    resultsEl.textContent="Pulsa un número para comenzar";
  }else{
    resultsEl.className="results";
    results.forEach((n,i)=>{
      const el=document.createElement("div");
      el.className="number"+(i===0?" latest":"");
      el.textContent=n;
      resultsEl.appendChild(el);
    });
  }
  resultCountEl.textContent=`${results.length} ${results.length===1?"tirada":"tiradas"}`;
}

function renderJumps(){
  jumpsEl.innerHTML="";
  if(!jumps.length){
    jumpsEl.className="jumps empty";
    jumpsEl.textContent="Los saltos aparecerán aquí";
  }else{
    jumpsEl.className="jumps";
    jumps.forEach(j=>{
      const el=document.createElement("div");
      el.className="jump "+(j>=0?"positive":"negative");
      el.textContent=j>0?`+${j}`:`${j}`;
      jumpsEl.appendChild(el);
    });
  }
  jumpCountEl.textContent=`${jumps.length} ${jumps.length===1?"salto":"saltos"}`;
}

function renderJumpGrid(){
  jumpGridEl.innerHTML="";
  for(let i=1;i<=18;i++){
    const count=jumpCounts.get(i);
    const cell=document.createElement("div");
    cell.className="jump-cell"+(count>0?" active":"");
    const label=document.createElement("div");
    label.className="label";
    label.textContent=`±${i}`;
    const counter=document.createElement("div");
    counter.className="count";
    counter.textContent=`${count} ${count===1?"vez":"veces"}`;
    cell.append(label,counter);
    jumpGridEl.appendChild(cell);
  }
}

function render(){renderResults();renderJumps();renderJumpGrid()}

function addResult(number){
  if(results.length){
    const jump=calculateJump(results[0],number);
    jumps.unshift(jump);
    const magnitude=Math.abs(jump);
    jumpCounts.set(magnitude,jumpCounts.get(magnitude)+1);
  }
  results.unshift(number);
  render();
}

function clearHistory(){
  results=[];
  jumps=[];
  for(let i=1;i<=18;i++) jumpCounts.set(i,0);
  render();
}

clearBtn.addEventListener("click",clearHistory);
buildNumberButtons();
render();
