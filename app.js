"use strict";

// Real European roulette wheel order.
// Forward through this array is positive.
const WHEEL = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

let results = [];
let jumps = [];
const counts = Array(19).fill(0);

const resultsEl = document.getElementById("results");
const jumpsEl = document.getElementById("jumps");
const resultCountEl = document.getElementById("resultCount");
const jumpCountEl = document.getElementById("jumpCount");
const clearBtn = document.getElementById("clearHistory");

function wheelIndex(n){ return WHEEL.indexOf(n); }

function getJump(previous, current){
  const a = wheelIndex(previous);
  const b = wheelIndex(current);
  let jump = (b - a + 37) % 37;
  // Shortest signed circular distance: -18 ... +18.
  if (jump > 18) jump -= 37;
  return jump;
}

function addResult(number){
  if(results.length > 0){
    const jump = getJump(results[0], number);
    jumps.unshift(jump);
    counts[Math.abs(jump)]++;
  }
  results.unshift(number);
  render();
}

function render(){
  if(results.length === 0){
    resultsEl.className="scroll-row empty";
    resultsEl.textContent="Pulsa un número para comenzar";
  }else{
    resultsEl.className="scroll-row";
    resultsEl.innerHTML="";
    results.forEach((n,i)=>{
      const el=document.createElement("div");
      el.className="number"+(i===0?" latest":"");
      el.textContent=n;
      resultsEl.appendChild(el);
    });
  }
  resultCountEl.textContent=`${results.length} ${results.length===1?"tirada":"tiradas"}`;

  if(jumps.length === 0){
    jumpsEl.className="scroll-row empty";
    jumpsEl.textContent="Los saltos aparecerán aquí";
  }else{
    jumpsEl.className="scroll-row";
    jumpsEl.innerHTML="";
    jumps.forEach(j=>{
      const el=document.createElement("div");
      el.className="jump";
      el.textContent=j>0?`+${j}`:`${j}`;
      jumpsEl.appendChild(el);
    });
  }
  jumpCountEl.textContent=`${jumps.length} ${jumps.length===1?"salto":"saltos"}`;

  document.querySelectorAll(".jump-cell").forEach(cell=>{
    const m=Number(cell.dataset.magnitude);
    const count=counts[m];
    cell.classList.toggle("active",count>0);
    cell.querySelector("small").textContent=`${count} ${count===1?"vez":"veces"}`;
  });
}

document.querySelectorAll(".number-btn").forEach(btn=>{
  btn.addEventListener("click",()=>addResult(Number(btn.dataset.number)));
});

clearBtn.addEventListener("click",()=>{
  results=[];
  jumps=[];
  counts.fill(0);
  render();
});

render();
