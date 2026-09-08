const WHEEL=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const STORAGE_KEY="europeanRouletteJumpTracker.results";
const DB_NAME="EuropeanRouletteJumpTrackerDB";
const DB_STORE="roulette";
const LEGACY_KEYS=["europeanRouletteJumpTracker.v10","europeanRouletteJumpTracker.v13","europeanRouletteJumpTracker.v14"];
let results=[],jumps=[];
const $=id=>document.getElementById(id);
const resultHistory=$("resultHistory"),jumpHistory=$("jumpHistory"),numberGrid=$("numberGrid"),detectedGrid=$("detectedGrid"),resultCount=$("resultCount"),jumpCount=$("jumpCount"),detectedCount=$("detectedCount"),frequencyList=$("frequencyList"),frequencyCount=$("frequencyCount"),undoResult=$("undoResult"),clearHistory=$("clearHistory"),referenceNumbers=$("referenceNumbers"),referenceJump=$("referenceJump");
const selectedJumpGrid=$("selectedJumpGrid"),selectedJumpResult=$("selectedJumpResult"),selectedJumpMetric=$("selectedJumpMetric");
let selectedMagnitude=1;
function color(n){return n===0?"green":REDS.has(n)?"red":"black"}
function calculateJump(previous,current){const previousIndex=WHEEL.indexOf(previous),currentIndex=WHEEL.indexOf(current);if(previousIndex===-1||currentIndex===-1)return null;let value=currentIndex-previousIndex;if(value>18)value-=37;if(value<-18)value+=37;return value}
function rebuildJumps(){const rebuilt=[];for(let i=0;i<results.length-1;i++){const value=calculateJump(results[i+1],results[i]);if(value!==null)rebuilt.push(value)}return rebuilt}
function openDatabase(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){reject(new Error("IndexedDB no disponible"));return}
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
async function saveIndexedDB(){
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE,"readwrite");
    tx.objectStore(DB_STORE).put({results:[...results]},"current");
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function loadIndexedDB(){
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(DB_STORE,"readonly");
    const req=tx.objectStore(DB_STORE).get("current");
    req.onsuccess=()=>{const value=req.result;db.close();resolve(value)};
    req.onerror=()=>{db.close();reject(req.error)};
  });
}
function validResults(value){return Array.isArray(value)?value.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=36):[]}
function saveData(){
  const payload={version:15,results:[...results]};
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(payload))}catch(e){}
  saveIndexedDB().catch(()=>{});
}
async function loadData(){
  let loaded=null;
  try{
    const data=await loadIndexedDB();
    if(data&&Array.isArray(data.results))loaded=validResults(data.results);
  }catch(e){}
  if(loaded===null){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(raw){const data=JSON.parse(raw);if(Array.isArray(data.results))loaded=validResults(data.results)}
    }catch(e){}
  }
  results=loaded||[];
  jumps=rebuildJumps();
}
function renderNumbers(){numberGrid.innerHTML="";for(let n=0;n<=36;n++){let b=document.createElement("button");b.className=`number-btn ${color(n)}`;b.textContent=n;b.addEventListener("click",()=>{results.unshift(n);jumps=rebuildJumps();saveData();render()});numberGrid.appendChild(b)}}
function renderResults(){resultHistory.innerHTML="";if(!results.length){resultHistory.className="history empty";resultHistory.textContent="Pulsa un número para registrar el resultado"}else{resultHistory.className="history";results.forEach(n=>{let x=document.createElement("div");x.className=`history-number ${color(n)}`;x.textContent=n;resultHistory.appendChild(x)})}resultCount.textContent=`${results.length} ${results.length===1?"resultado":"resultados"}`;undoResult.disabled=!results.length}
function renderJumps(){jumpHistory.innerHTML="";if(!jumps.length){jumpHistory.className="jump-history empty";jumpHistory.textContent="Los saltos aparecerán aquí al registrar dos resultados"}else{jumpHistory.className="jump-history";jumps.forEach(j=>{let x=document.createElement("div");x.className=`jump-chip ${j>0?"positive":""}`;x.textContent=j>0?`+${j}`:j;jumpHistory.appendChild(x)})}jumpCount.textContent=`${jumps.length} ${jumps.length===1?"salto":"saltos"}`}
function renderDetected(){detectedGrid.innerHTML="";const detected=new Set();jumps.forEach(value=>{const magnitude=Math.abs(value);if(magnitude>=1&&magnitude<=18)detected.add(magnitude)});for(let n=1;n<=18;n++){const cell=document.createElement("div");cell.className="detected-cell";cell.textContent=`±${n}`;if(detected.has(n))cell.classList.add("active");detectedGrid.appendChild(cell)}detectedCount.textContent=`${detected.size} / 18`}
function renderFrequency(){frequencyList.innerHTML="";if(!jumps.length){frequencyList.className="frequency-list empty";frequencyList.textContent="La frecuencia aparecerá aquí al registrar saltos";frequencyCount.textContent="0 saltos registrados";return}let m=new Map;jumps.forEach(j=>{let n=Math.abs(j);m.set(n,(m.get(n)||0)+1)});let a=[...m.entries()].sort((x,y)=>y[1]-x[1]||x[0]-y[0]),max=a[0][1];frequencyList.className="frequency-list";a.forEach(([n,c],i)=>{let r=document.createElement("div");r.className="frequency-row";const since=jumps.findIndex(j=>Math.abs(j)===n);r.innerHTML=`<div class="frequency-rank">#${i+1}</div><div class="frequency-jump">±${n}</div><div class="frequency-bar-wrap"><div class="frequency-bar" style="width:${c/max*100}%"></div></div><div class="frequency-value">${c}<span>${c===1?"vez":"veces"}</span></div><div class="frequency-since">${since} ${since===1?"tirada":"tiradas"} sin salir</div>`;frequencyList.appendChild(r)});frequencyCount.textContent=`${jumps.length} ${jumps.length===1?"salto registrado":"saltos registrados"}`}
function renderReference(){
  referenceNumbers.innerHTML="";
  const average20El=$("referenceAverage20");
  if(average20El) average20El.innerHTML="";
  if(!results.length||!jumps.length){
    referenceJump.textContent="Sin referencia";
    referenceNumbers.textContent="Registra al menos dos resultados";
    return;
  }
  const ref=getReferenceForState(results);
  if(!ref){referenceJump.textContent="Sin referencia";referenceNumbers.textContent="Registra al menos dos resultados";return;}
  referenceJump.textContent=`±${ref.magnitude} · nº 1`;
  const minusSign=document.createElement("span");minusSign.className="reference-sign";minusSign.textContent="−";
  const minusNumber=document.createElement("div");minusNumber.className=`reference-number ${color(ref.minus)}`;minusNumber.textContent=ref.minus;
  const arrow=document.createElement("span");arrow.className="reference-arrow";arrow.textContent=`↔  ${ref.current}  ↔`;
  const plusNumber=document.createElement("div");plusNumber.className=`reference-number ${color(ref.plus)}`;plusNumber.textContent=ref.plus;
  const plusSign=document.createElement("span");plusSign.className="reference-sign";plusSign.textContent="+";
  referenceNumbers.append(minusSign,minusNumber,arrow,plusNumber,plusSign);
  if(average20El){
    const recent20=jumps.slice(0,20).map(Math.abs);
    if(recent20.length){
      const avg=recent20.reduce((a,b)=>a+b,0)/recent20.length;
      const magnitude=Math.max(1,Math.min(18,Math.round(avg)));
      const idx=WHEEL.indexOf(ref.current);
      const avgPlus=WHEEL[(idx+magnitude)%37];
      const avgMinus=WHEEL[(idx-magnitude+37)%37];
      average20El.innerHTML=`<div class="reference-average20-label">MAGNITUD MEDIA · ÚLTIMOS ${recent20.length}</div><div class="reference-average20-main"><strong>±${magnitude}</strong><span>(${avg.toFixed(1)})</span><span class="reference-average20-arrow">→</span><b class="${color(avgMinus)}">${avgMinus}</b><span>/</span><b class="${color(avgPlus)}">${avgPlus}</b></div>`;
    }else{
      average20El.textContent="Se necesitan saltos para calcular la media";
    }
  }
}
function getReferenceForState(stateResults){
  if(!Array.isArray(stateResults)||stateResults.length<2)return null;
  const stateJumps=[];
  for(let i=0;i<stateResults.length-1;i++){
    const value=calculateJump(stateResults[i+1],stateResults[i]);
    if(value!==null)stateJumps.push(value);
  }
  if(!stateJumps.length)return null;
  const counts=new Map();
  stateJumps.forEach(value=>{const magnitude=Math.abs(value);counts.set(magnitude,(counts.get(magnitude)||0)+1)});
  const ordered=[...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0]);
  const magnitude=ordered[0][0];
  const current=stateResults[0];
  const currentIndex=WHEEL.indexOf(current);
  if(currentIndex<0)return null;
  return {magnitude,current,plus:WHEEL[(currentIndex+magnitude)%37],minus:WHEEL[(currentIndex-magnitude+37)%37]};
}
function renderSelectedJump(){
  if(!selectedJumpGrid||!selectedJumpResult)return;
  selectedJumpGrid.innerHTML="";
  for(let n=1;n<=18;n++){
    let b=document.createElement("button");
    b.type="button";
    b.className=`selected-jump-btn ${n===selectedMagnitude?"active":""}`;
    b.textContent=`±${n}`;
    b.addEventListener("click",()=>{selectedMagnitude=n;renderSelectedJump()});
    selectedJumpGrid.appendChild(b);
  }
  selectedJumpMetric.textContent=`±${selectedMagnitude} seleccionado`;
  const selectedResult=results[0];
  selectedJumpResult.innerHTML="";
  if(selectedResult===undefined){
    selectedJumpResult.textContent="Registra un resultado para consultar sus posiciones";
    return;
  }
  const idx=WHEEL.indexOf(selectedResult);
  const plus=WHEEL[(idx+selectedMagnitude)%37];
  const minus=WHEEL[(idx-selectedMagnitude+37)%37];
  const query=document.createElement("div");query.className="selected-query";
  const source=document.createElement("div");source.className=`selected-result ${color(selectedResult)}`;source.textContent=selectedResult;
  const label=document.createElement("span");label.className="selected-query-label";label.textContent=`RESULTADO ±${selectedMagnitude}`;
  query.append(source,label);
  const minusWrap=document.createElement("div");minusWrap.className="selected-target";
  const minusSign=document.createElement("span");minusSign.className="selected-side";minusSign.textContent="−";
  const minusEl=document.createElement("div");minusEl.className=`selected-number ${color(minus)}`;minusEl.textContent=minus;
  minusWrap.append(minusSign,minusEl);
  const plusWrap=document.createElement("div");plusWrap.className="selected-target";
  const plusSign=document.createElement("span");plusSign.className="selected-side";plusSign.textContent="+";
  const plusEl=document.createElement("div");plusEl.className=`selected-number ${color(plus)}`;plusEl.textContent=plus;
  plusWrap.append(plusSign,plusEl);
  selectedJumpResult.append(query,minusWrap,plusWrap);
}

function render(){renderResults();renderJumps();renderDetected();renderFrequency();renderReference();renderSelectedJump()}
undoResult.addEventListener("click",()=>{if(results.length){results.shift();jumps=rebuildJumps();saveData();render()}});
clearHistory.addEventListener("click",()=>{results=[];jumps=[];saveData();render()});
(async function init(){await loadData();renderNumbers();render()})();
