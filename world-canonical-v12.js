/* ModelQuest v12 — canonical curriculum renderer.
 * Runtime teaching content comes from MQ_CURRICULUM. This file owns navigation/presentation only.
 * No duplicate titles, questions, challenges, runnable code, baselines or failure notes live here.
 */
(()=>{
  'use strict';
  const C=()=>globalThis.MQ_CURRICULUM||[];
  const KEY='modelquest-progress-v12';
  const STEPS=[
    ['WHY','Why does this problem exist?'],
    ['DATA','What information do we actually have?'],
    ['HOW','How does the idea solve the problem?'],
    ['TRY IT','Change it and watch what happens'],
    ['MATH','Numbers before symbols'],
    ['CODE','Make the computer do it'],
    ['WHEN / REALITY','When to use it and how it fails'],
    ['PROVE IT','Explain it before moving on']
  ];
  const UI={
    1:{region:'Prediction Valley',input:'Sensor voltage (V)',output:'Force (N)',rows:[['0.42 V','10 N'],['0.81 V','20 N'],['1.22 V','30 N'],['1.60 V','40 N'],['1.98 V','50 N']]},
    2:{region:'Prediction Valley',input:'Thickness error + roughness + hole error',output:'PASS / FAIL',rows:[['0.01 mm · Ra 0.8 · 0.01 mm','PASS'],['0.03 · 1.3 · 0.02','PASS'],['0.08 · 2.6 · 0.04','FAIL'],['0.11 · 3.1 · 0.06','FAIL']]},
    3:{region:'Decision Woods',input:'Vibration + temperature + load',output:'Machine state',rows:[['1.1 mm/s · 55°C · 40%','NORMAL'],['4.9 · 70°C · 55%','UNBALANCED'],['2.3 · 86°C · 95%','OVERLOAD']]},
    4:{region:'Decision Woods',input:'Distance + queue + weather + express',output:'ON TIME / LATE',rows:[['320 km · 3 h · clear · express','ON TIME'],['890 km · 14 h · clear · standard','LATE'],['120 km · 18 h · delay · standard','LATE']]},
    5:{region:'Ensemble Forest',input:'Temperature + vibration + current + age',output:'Failure risk',rows:[['61°C · 1.2 mm/s · 4.2 A · 8 mo','HEALTHY'],['76°C · 3.6 · 5.1 A · 24 mo','WATCH'],['89°C · 6.8 · 6.4 A · 41 mo','FAILURE']]},
    6:{region:'Discovery Islands',input:'RPM + current + vibration + temperature + acoustic',output:'Unlabeled groups',rows:[['700 rpm · 1.7 A · 0.7 mm/s · 48°C','?'],['1450 · 3.5 · 1.3 · 63°C','?'],['2250 · 6.1 · 3.8 · 82°C','?']]},
    7:{region:'Neural Highlands',input:'Torque + temperature + vibration',output:'Operating-state class',rows:[['18 · 58°C · 1.3','NORMAL'],['34 · 82°C · 4.4','OVERLOAD'],['21 · 66°C · 6.0','UNBALANCED']]},
    8:{region:'Neural Highlands',input:'Old-batch / new-batch measurements',output:'Reliable unseen-batch prediction',rows:[['Old supplier · familiar tolerance pattern','training'],['Old supplier · held-out parts','validation'],['New supplier · shifted material/process','future reality']]},
    9:{region:'Vision Ridge',input:'Surface-image pixels',output:'Clean / scratch / pit',rows:[['local bright edge + texture','SCRATCH'],['small circular depression pattern','PIT'],['uniform surface patch','CLEAN']]},
    10:{region:'Memory Pass',input:'Ordered power readings',output:'Next power reading',rows:[['20 → 25 → 30 → 35','rising history'],['50 → 45 → 40 → 35','falling history'],['same current value: 35','different likely next value']]},
    11:{region:'Attention City',input:'Maintenance-note tokens',output:'Context-aware representation',rows:[['motor hot after bearing replacement','component + symptom + context'],['bearing changed; noise under load','relationship across words']]},
    12:{region:'AI Forge',input:'Technician note + desired report example',output:'Structured maintenance report',rows:[['motor hot after bearing replacement','Component: motor · Problem: heat'],['pump noisy after seal change','Component: pump · Problem: noise']]},
    13:{region:'Final Frontier',input:'Question + manuals / SOPs / service records',output:'Grounded answer + evidence',rows:[['Bearing bulletin: >85°C inspect lubrication/alignment','high relevance'],['Network/IP configuration procedure','low relevance'],['Question: bearing housing above 85°C?','retrieve evidence first']]}
  };
  let st={current:1,screen:0,completed:{},screens:{}};
  try{st={...st,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}

  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const item=id=>C().find(x=>x.id===Number(id));
  const ui=id=>UI[id]||{region:'ML World',input:'Model inputs',output:'Model output',rows:[]};
  function save(){localStorage.setItem(KEY,JSON.stringify(st));renderSide();}
  function toast(text){const t=$('#toast');if(!t)return;t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1400)}
  async function copy(text){try{await navigator.clipboard.writeText(text)}catch(e){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}toast('Copied')}
  function pct(){return Math.round(Object.keys(st.completed||{}).filter(k=>st.completed[k]).length/13*100)}

  function renderSide(){
    const side=$('#side'),mobile=$('#mobile');if(!side||!mobile)return;
    const html=`<div class="stage">JOURNEY · ${pct()}%</div>`+C().map(m=>`<button class="model ${m.id===st.current?'active':''}" data-cgo="${m.id}"><span class="num">${String(m.id).padStart(2,'0')}</span><span class="mtxt"><b>${esc(m.title)}</b><small>${esc(m.subtitle)}</small></span><span class="check">${st.completed[m.id]?'✓':''}</span></button>`).join('');
    side.innerHTML=html;mobile.innerHTML=C().map(m=>`<button class="model ${m.id===st.current?'active':''}" data-cgo="${m.id}"><span class="num">${m.id}</span><span class="mtxt"><b>${esc(m.title)}</b></span></button>`).join('');
    $$('[data-cgo]').forEach(b=>b.onclick=()=>go(Number(b.dataset.cgo)));
  }
  function bindHeader(){
    $('#resume').onclick=()=>go(st.current||1,st.screens?.[st.current]||st.screen||0);
    $('#theme').style.display='none';
    $('#searchOpen').onclick=()=>{$('#searchModal').classList.add('open');setTimeout(()=>$('#searchInput')?.focus(),20)};
    $('#closeSearch').onclick=()=>$('#searchModal').classList.remove('open');
    $('#closeStuck').onclick=()=>$('#stuckModal').classList.remove('open');
    $('#exportBtn').onclick=()=>{const a=document.createElement('a');const u=URL.createObjectURL(new Blob([JSON.stringify(st,null,2)],{type:'application/json'}));a.href=u;a.download='modelquest-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),500)};
    $('#importBtn').onclick=()=>$('#importFile').click();
    $('#importFile').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{st={...st,...JSON.parse(r.result)};save();showHome();toast('Progress restored')}catch(_){toast('Could not read backup')}};r.readAsText(f)};
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#searchOpen').click()}if(e.key==='Escape')$$('.modalback').forEach(x=>x.classList.remove('open'))});
    $$('.modalback').forEach(m=>m.onclick=e=>{if(e.target===m)m.classList.remove('open')});
  }

  function showLanding(){
    $('#homeHero').style.display='none';
    $('#view').innerHTML=`<div class="v5-root"><section class="v5-landing"><div class="v5-gridbg"></div><div class="v5-hero-content"><div class="v5-kicker">MODELQUEST · CANONICAL CURRICULUM</div><h1 class="v5-hero-title">Understand why before learning what.</h1><p class="v5-hero-sub">One continuous engineering journey. Every quest starts from the problem, builds the missing idea, lets you manipulate it, then gives the formal name, math and code.</p><div class="v5-hero-actions"><button class="v5-btn primary large" id="cStart">Start / World Map →</button><button class="v5-btn large" id="cResume">Resume Model ${st.current}</button></div><div class="v5-hero-meta"><div class="v5-meta"><b>13</b>canonical quests</div><div class="v5-meta"><b>${pct()}%</b>journey complete</div><div class="v5-meta"><b>Why-first</b>teaching path</div></div></div></section></div>`;
    $('#cStart').onclick=showMap;$('#cResume').onclick=()=>go(st.current||1,st.screens?.[st.current]||0);
  }
  function showMap(){
    const cards=C().map(m=>{const u=ui(m.id);const prereq=m.id>1?`Builds on ${esc(m.prerequisites.slice(0,2).join(' · '))}`:'No ML prerequisites';return `<button class="v5-node ${st.completed[m.id]?'done':''} ${m.id===st.current?'current':''}" data-mapgo="${m.id}"><span class="v5-num">${String(m.id).padStart(2,'0')} · ${esc(u.region)}</span><h3>${esc(m.title)}</h3><div class="alg">${esc(m.subtitle)}</div><div class="v5-est">${esc(m.time)} · Difficulty ${m.difficulty}/5</div><small>${prereq}</small></button>`}).join('');
    $('#view').innerHTML=`<div class="v5-root"><main class="v5-map-wrap"><div class="v5-map-head"><div><div class="v5-kicker">THE ML WORLD</div><h1>Follow the foundation, or inspect ahead.</h1><p>Nothing is hard-locked. Later quests tell you what they assume so you can repair a missing foundation instead of guessing.</p></div><div class="v5-map-legend">${pct()}% complete</div></div><section class="v5-world">${cards}</section><div class="v5-map-actions"><button class="v5-btn" id="cMapBase">Base Camp · start from zero</button><button class="v5-btn" id="cMapHome">← Landing</button></div></main></div>`;
    $$('[data-mapgo]').forEach(b=>b.onclick=()=>go(Number(b.dataset.mapgo),st.screens?.[b.dataset.mapgo]||0));
    $('#cMapBase').onclick=()=>globalThis.MQ_OPEN_BASE_CAMP?.();$('#cMapHome').onclick=showLanding;
  }

  function screen0(c,u){return `<div class="v5-screen-head"><div class="v5-card"><div class="v5-kicker">WHY FIRST</div><div class="v5-question">${esc(c.hook)}</div><div class="v5-eli5"><b>Why this chapter exists</b><br>${esc(c.goal)}</div><div class="v5-card" style="margin-top:14px"><small>WHAT MUST ALREADY MAKE SENSE</small><div class="chips">${c.prerequisites.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></div></div><div class="v5-card dark"><div class="v5-kicker">PROBLEM SHAPE</div><h2>${esc(u.input)} → ? → ${esc(u.output)}</h2><p>Do not name the algorithm yet. First make sure you understand what information is known, what answer is missing, and why that missing answer matters.</p><div class="v5-mini-flow"><span class="v5-pill">Known information</span><span class="v5-arrow">→</span><span class="v5-pill">Need a rule</span><span class="v5-arrow">→</span><span class="v5-pill">Missing answer</span></div></div></div>`}
  function screen1(c,u){return `<div class="v5-data-grid"><div class="v5-card"><div class="v5-kicker">DATA BEFORE MODEL</div><h2>What does one real example look like?</h2><table class="v5-table"><thead><tr><th>What we know</th><th>What it means / answer</th></tr></thead><tbody>${u.rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table><p>A dataset is many consistently recorded examples. If the needed pattern is not represented in those examples, the model cannot invent reliable evidence.</p></div><div class="v5-card"><div class="v5-kicker">THE BASIC ORGANIZATION</div><div class="v5-data-legend"><div><b>Input / feature</b><strong>${esc(u.input)}</strong></div><div><b>Answer / target / label</b><strong>${esc(u.output)}</strong></div><div><b>One row</b><strong>One observation or example</strong></div><div><b>Many rows</b><strong>The dataset used to look for repeatable structure</strong></div></div></div></div>`}
  function screen2(c){return `<div class="v5-card"><div class="v5-kicker">HOW — BUILD THE IDEA BEFORE THE NAME</div><h2>The mechanism is a sequence of needs.</h2><p>Each step below is something the learner should be able to explain before the technical vocabulary becomes useful.</p><div class="mq12-flow">${c.missions.map((m,i)=>`<article><span>${i+1}</span><div><small>NEED ${i+1}</small><h3>${esc(m)}</h3></div></article>`).join('')}</div><div class="v5-kicker" style="margin-top:22px">ONLY AFTER THE MECHANISM</div><div class="chips">${c.concepts.map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div><p style="margin-top:12px"><b>Formal name:</b> ${esc(c.subtitle)}</p></div>`}
  function screen3(c){return `<div class="v5-stage-grid"><div class="v5-labhost" id="v5Lab">${c.id===1?`<div class="mq12-model1"><h2>Model 1 calibration lab</h2><p>The original calibration lab is being replaced by the same canonical lab contract as Models 2–13. For now, use the worked slope/gradient visuals in the Math step and the runnable calibration code.</p><button class="v5-btn primary" id="mq12ToMath">Go to numbers + Gradient Descent →</button></div>`:globalThis.mqLabFor?.(c.id)||'<div class="v5-card">Lab unavailable.</div>'}</div><aside class="v5-lab-side"><div class="v5-side-card"><small>LEARNING RULE</small><h3>Predict → change one thing → observe → explain.</h3><p>Moving controls without predicting first turns the lab into a toy. State what you expect, then test it.</p></div><div class="v5-side-card"><small>WHAT THIS LAB MUST TEACH</small><p>${esc(c.expected)}</p></div></aside></div>`}
  function screen4(c){return `<div class="v5-card"><div class="v5-kicker">MATH — NUMBERS BEFORE SYMBOLS</div><h2>Do not memorize a formula you cannot explain with small numbers.</h2><p>The worked numeric example for ${esc(c.title)} appears below. First understand the arithmetic and what problem the calculation solves. Only then keep the compact notation.</p><div class="chips">${c.concepts.slice(0,6).map(x=>`<span class="chip">${esc(x)}</span>`).join('')}</div></div>`}
  function screen5(c){return `<div class="v5-code-grid"><div class="v5-card"><div class="v5-kicker">CODE IS THE SAME IDEA IN ANOTHER LANGUAGE</div><h2>Before running it</h2><p><b>Baseline:</b> ${esc(c.baseline)}</p><p><b>Expected:</b> ${esc(c.expected)}</p><p><b>Environment:</b> ${esc(c.environment)}</p><p>Read the program as: create/collect data → establish a baseline → build the method → fit/use it → inspect a result. The exact library calls are not the concept.</p></div><div><div class="v5-codebox"><div class="v5-codebar"><span>Python · Model ${c.id} · ${esc(c.title)}</span><div><button class="v5-btn" id="cCopy">Copy</button> <button class="v5-btn primary" id="cColab">Copy + Open Colab ↗</button></div></div><pre>${esc(c.code)}</pre></div></div></div>`}
  function screen6(c){return `<div class="v5-card"><div class="v5-kicker">WHEN / REALITY</div><h2>Knowing when not to trust a model is part of knowing the model.</h2><div class="v5-real-grid">${c.real.map((r,i)=>`<div class="v5-trap"><h3>${i===0?'Failure mode':'Reality check '+(i+1)}</h3><p>${esc(r)}</p></div>`).join('')}</div><div class="v5-data-grid" style="margin-top:16px"><div class="v5-card"><small>BASELINE</small><h3>What should this beat?</h3><p>${esc(c.baseline)}</p></div><div class="v5-card"><small>SANITY CHECK</small><h3>What should a healthy run look like?</h3><p>${esc(c.expected)}</p></div></div></div>`}
  function screen7(c){return `<div class="v5-challenge"><div class="v5-kicker">PROVE IT · REASON BEFORE RUNNING</div><h2>${esc(c.challenge)}</h2><p>Explain the WHY first: what problem are you testing, what do you predict will change, and what result would change your mind?</p><textarea id="cReason" class="mq12-reason" placeholder="Write your prediction and reasoning before marking the quest complete…"></textarea><div class="v5-mini-flow"><span class="v5-pill">Why</span><span class="v5-arrow">→</span><span class="v5-pill">Prediction</span><span class="v5-arrow">→</span><span class="v5-pill">Experiment</span><span class="v5-arrow">→</span><span class="v5-pill">Explanation</span></div><button class="v5-btn primary" style="margin-top:18px" id="cComplete">Mark complete after explaining</button></div>`}

  function renderQuest(){
    const c=item(st.current),u=ui(st.current),s=st.screen||0;if(!c)return showMap();
    const body=[screen0,screen1,screen2,screen3,screen4,screen5,screen6,screen7][s](c,u);
    $('#view').innerHTML=`<div class="v5-root"><main class="v5-quest"><div class="v5-quest-top"><button class="v5-btn" id="cWorld">← Main World</button><div class="v5-quest-actions"><button class="v5-btn" id="cBase">Back to Basics</button><button class="v5-btn" id="cStuck">I’m Stuck</button><button class="v5-btn" id="cClose">Close for Today</button></div></div><div class="v5-quest-title"><div><div class="v5-kicker">MODEL ${String(c.id).padStart(2,'0')} · ${esc(u.region)}</div><h1>${esc(c.title)}</h1><p><b>${esc(c.subtitle)}</b> · ${esc(c.goal)}</p></div><div class="v5-quest-badge">Difficulty ${c.difficulty}/5<br>${esc(c.time)}</div></div><div class="v5-stepbar">${STEPS.map((x,i)=>`<button class="v5-step ${i===s?'active':i<s?'done':''}" data-step="${i}"><b>${i+1}. ${x[0]}</b>${x[1]}</button>`).join('')}</div><section class="v5-screen v5-quest-body">${body}</section><div class="v5-footer"><button class="v5-btn" id="cPrev">${s===0?'← World':'← Back'}</button><button class="v5-btn primary" id="cNext">${s===7?(c.id===13?'Finish Journey':'Next Model →'):'Next →'}</button></div></main></div>`;
    $$('[data-step]').forEach(b=>b.onclick=()=>go(c.id,Number(b.dataset.step)));
    $('#cWorld').onclick=showMap;$('#cBase').onclick=()=>globalThis.MQ_OPEN_BASE_CAMP?.();$('#cStuck').onclick=()=>globalThis.openStuck?.();$('#cClose').onclick=()=>{save();showLanding()};
    $('#cPrev').onclick=()=>s===0?showMap():go(c.id,s-1);$('#cNext').onclick=()=>{if(s===7){if(!st.completed[c.id]){const reason=$('#cReason')?.value.trim();if(reason&&reason.length>=20)st.completed[c.id]=true;else{toast('Explain your prediction first');return}}save();c.id<13?go(c.id+1,0):showMap()}else go(c.id,s+1)};
    if(s===3){if(c.id===1)$('#mq12ToMath').onclick=()=>go(1,4);else setTimeout(()=>globalThis.mqInitLab?.(c.id),0)}
    if(s===5){$('#cCopy').onclick=()=>copy(c.code);$('#cColab').onclick=async()=>{await copy(c.code);window.open('https://colab.research.google.com/#create=true','_blank','noopener')}}
    if(s===7)$('#cComplete').onclick=()=>{const reason=$('#cReason').value.trim();if(reason.length<20){toast('Write your reasoning first');return}st.completed[c.id]=true;save();toast('Quest complete')};
    save();scrollTo({top:0,behavior:'smooth'});
  }
  function go(id,screen){const c=item(id);if(!c)return;st.current=c.id;st.screen=Number.isFinite(Number(screen))?Math.max(0,Math.min(7,Number(screen))):(st.screens?.[c.id]||0);st.screens=st.screens||{};st.screens[c.id]=st.screen;save();renderQuest()}

  globalThis.go=go;
  globalThis.showHome=showLanding;
  globalThis.MQ_SHOW_MAP=showMap;
  bindHeader();renderSide();showLanding();
})();