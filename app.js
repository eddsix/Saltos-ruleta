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
  const evaluations=getReferenceEvaluations();
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
  const wrap=document.createElement("div");wrap.className="reference-result-wrap";
  const label=document.createElement("span");label.className="reference-result-label";label.textContent=evaluations.length?"Última referencia evaluada":"Referencia pendiente";
  const badge=document.createElement("strong");badge.className=`reference-result-badge ${evaluations.length&&evaluations[0].win?"win":"loss"}`;badge.textContent=evaluations.length?(evaluations[0].win?"WIN":"LOSS"):"PENDIENTE";
  wrap.append(label,badge);
  referenceNumbers.append(minusSign,minusNumber,arrow,plusNumber,plusSign);
  referenceNumbers.appendChild(wrap);
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
function getReferenceEvaluations(){
  const evaluations=[];
  for(let i=1;i<results.length-1;i++){
    const ref=getReferenceForState(results.slice(i));
    if(!ref)continue;
    const nextResult=results[i-1];
    const win=nextResult===ref.plus||nextResult===ref.minus;
    evaluations.push({reference:ref,nextResult,win});
  }
  return evaluations;
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

// Análisis adicional: no interviene en ninguno de los cálculos existentes.
const magnitudeAverages=$("magnitudeAverages"),sequenceSummary=$("sequenceSummary"),sequencePairs=$("sequencePairs"),sequenceTransitions=$("sequenceTransitions"),sequenceSample=$("sequenceSample"),wheelMap=$("wheelMap"),wheelDetail=$("wheelDetail"),wheelStatsCount=$("wheelStatsCount");
let wheelSelectedNumber=null;
function renderMagnitudeAverages(){
  if(!magnitudeAverages)return;
  magnitudeAverages.innerHTML="";
  [10,20,30].forEach(windowSize=>{
    const sample=jumps.slice(0,windowSize).map(Math.abs);
    const avg=sample.length?sample.reduce((a,b)=>a+b,0)/sample.length:null;
    const card=document.createElement("div");card.className="average-card";
    card.innerHTML=`<div><small>ÚLTIMOS ${windowSize}</small><div class="average-value">${avg===null?"—":avg.toFixed(2)}</div></div><div class="average-count">${sample.length} ${sample.length===1?"salto":"saltos"}</div>`;
    magnitudeAverages.appendChild(card);
  });
}
function renderSequences(){
  if(!sequencePairs||!sequenceTransitions)return;
  const total=jumps.length;
  sequencePairs.innerHTML="";sequenceTransitions.innerHTML="";sequenceSummary.innerHTML="";
  if(total<2){
    sequencePairs.className="sequence-list empty";sequencePairs.textContent="Registra al menos dos saltos";
    sequenceTransitions.className="sequence-list empty";sequenceTransitions.textContent="Registra al menos dos saltos";
    sequenceSample.textContent=`${total} ${total===1?"transición":"transiciones"}`;
    return;
  }
  const pairMap=new Map(), magnitudeTransition=new Map(), directionTransition=new Map();
  for(let i=0;i<total-1;i++){
    const a=jumps[i],b=jumps[i+1];
    const key=`${a>0?"+":""}${a} → ${b>0?"+":""}${b}`;
    pairMap.set(key,(pairMap.get(key)||0)+1);
    const am=Math.abs(a),bm=Math.abs(b),mk=`±${am} → ±${bm}`;
    if(!magnitudeTransition.has(mk))magnitudeTransition.set(mk,{count:0,from:am,to:bm});
    magnitudeTransition.get(mk).count++;
    const dk=`${a>0?"+":"−"} → ${b>0?"+":"−"}`;directionTransition.set(dk,(directionTransition.get(dk)||0)+1);
  }
  const pairs=[...pairMap.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const mags=[...magnitudeTransition.entries()].sort((a,b)=>b[1].count-a[1].count||a[1].from-b[1].from||a[1].to-b[1].to);
  const uniquePairs=pairs.length, repeatPairs=pairs.filter(x=>x[1]>1).length, maxPair=pairs[0];
  const summary=[
    ["TRANSICIONES",total-1],
    ["PARES ÚNICOS",uniquePairs],
    ["PARES REPETIDOS",repeatPairs],
    ["MÁS REPETIDO",maxPair?`${maxPair[1]}×`:"—"]
  ];
  summary.forEach(([label,value])=>{const s=document.createElement("div");s.className="sequence-stat";s.innerHTML=`<span>${label}</span><strong>${value}</strong>`;sequenceSummary.appendChild(s)});
  sequenceSample.textContent=`${total-1} transiciones · ${uniquePairs} pares únicos`;
  sequencePairs.className="sequence-list";
  pairs.slice(0,12).forEach(([key,count])=>{const r=document.createElement("div");r.className="sequence-row";r.innerHTML=`<div class="sequence-key">${key}</div><div class="sequence-count">${count}×</div><div class="sequence-percent">${((count/(total-1))*100).toFixed(1)}%</div>`;sequencePairs.appendChild(r)});
  sequenceTransitions.className="sequence-list";
  mags.slice(0,18).forEach(([key,obj])=>{const r=document.createElement("div");r.className="sequence-row";r.innerHTML=`<div class="sequence-key">${key}</div><div class="sequence-count">${obj.count}×</div><div class="sequence-percent">${((obj.count/(total-1))*100).toFixed(1)}%</div>`;sequenceTransitions.appendChild(r)});
  const dirBox=document.createElement("div");dirBox.className="sequence-direction-summary";
  ["+ → +","+ → −","− → +","− → −"].forEach(k=>{const c=directionTransition.get(k)||0;const item=document.createElement("span");item.textContent=`${k} ${c}×`;dirBox.appendChild(item)});
  sequenceTransitions.appendChild(dirBox);
}
function getNumberStats(n){
  const count=results.filter(x=>x===n).length;
  const pct=results.length?(count/results.length)*100:0;
  const idx=WHEEL.indexOf(n);
  let incoming=0,outgoing=0,plus=0,minus=0;
  jumps.forEach((j,i)=>{
    const current=results[i],previous=results[i+1];
    if(current===n){outgoing++;if(j>0)plus++;if(j<0)minus++;}
    if(previous===n)incoming++;
  });
  return {count,pct,incoming,outgoing,plus,minus,position:idx+1};
}
function renderWheel(){
  if(!wheelMap)return;
  wheelMap.innerHTML="";
  const counts=new Map();results.forEach(n=>counts.set(n,(counts.get(n)||0)+1));
  const maxCount=Math.max(1,...counts.values());
  WHEEL.forEach((n,i)=>{
    const el=document.createElement("button");el.type="button";el.className=`wheel-number ${color(n)}`;
    const angle=(i/WHEEL.length)*360;
    const frequency=counts.get(n)||0;
    const radians=(angle-90)*Math.PI/180;
    const radius=41;
    el.style.left=`${50+radius*Math.cos(radians)}%`;
    el.style.top=`${50+radius*Math.sin(radians)}%`;
    if(frequency===maxCount&&frequency>0)el.classList.add("hot");
    if(results[0]===n)el.classList.add("current");
    if(wheelSelectedNumber===n)el.classList.add("selected");
    el.textContent=n;
    el.title=`${n} · ${frequency} ${frequency===1?"aparición":"apariciones"}`;
    el.addEventListener("click",()=>{wheelSelectedNumber=n;renderWheel()});
    wheelMap.appendChild(el);
  });
  const center=document.createElement("div");center.className="wheel-center";center.textContent="EUROPEA";wheelMap.appendChild(center);
  wheelStatsCount.textContent=`${results.length} ${results.length===1?"resultado":"resultados"}`;
  renderWheelDetail();
}
function renderWheelDetail(){
  if(!wheelDetail)return;
  const n=wheelSelectedNumber!==null?wheelSelectedNumber:results[0];
  if(n===undefined){wheelDetail.textContent="Registra resultados para analizar la rueda";return;}
  const s=getNumberStats(n),idx=WHEEL.indexOf(n);
  const left=WHEEL[(idx-1+37)%37],right=WHEEL[(idx+1)%37];
  const plus7=WHEEL[(idx+7)%37],minus7=WHEEL[(idx-7+37)%37];
  const top=[...new Set(results)].sort((a,b)=>(countsForWheel(b)-countsForWheel(a))||a-b).slice(0,5);
  wheelDetail.innerHTML=`<div class="wheel-detail-title"><div class="wheel-detail-number ${color(n)}">${n}</div><div><strong>Número ${n}</strong><div class="average-count">Posición ${s.position} de 37</div></div></div><div class="wheel-detail-grid"><div class="wheel-stat"><span>APARICIONES</span><strong>${s.count}</strong></div><div class="wheel-stat"><span>PORCENTAJE</span><strong>${s.pct.toFixed(2)}%</strong></div><div class="wheel-stat"><span>ENTRADAS</span><strong>${s.incoming}</strong></div><div class="wheel-stat"><span>SALIDAS</span><strong>${s.outgoing}</strong></div><div class="wheel-stat"><span>SALIDAS +</span><strong>${s.plus}</strong></div><div class="wheel-stat"><span>SALIDAS −</span><strong>${s.minus}</strong></div></div><div class="wheel-neighbors"><strong>Vecinos:</strong> ${left} · ${right}<br><strong>±7:</strong> −${minus7} · +${plus7}<br><strong>Más frecuentes:</strong> ${top.length?top.join(" · "):"—"}</div><div class="wheel-legend"><span class="legend-item"><i class="legend-dot current-dot"></i>Último resultado</span><span class="legend-item"><i class="legend-dot hot-dot"></i>Más frecuente</span><span class="legend-item">Pulsa un número para analizarlo</span></div>`;
}
function countsForWheel(n){return results.filter(x=>x===n).length}
const oldRender=render;
render=function(){oldRender();renderMagnitudeAverages();renderSequences();renderWheel()};
