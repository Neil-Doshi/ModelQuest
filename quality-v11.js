/* ModelQuest v11 — beginner foundation, prerequisites, baselines and expected-output guidance. */
(() => {
  const byId = id => (globalThis.MQ_CURRICULUM || []).find(x => x.id === Number(id));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function currentId(){
    const text = document.querySelector('.v5-quest-title .v5-kicker')?.textContent || document.querySelector('.eyebrow')?.textContent || '';
    const m = text.match(/MODEL\s+0?(\d+)/i);
    return m ? Number(m[1]) : null;
  }

  function baseCampHTML(){
    const steps = [
      ['1 · What is a notebook?', 'A notebook is a document made of small blocks called cells. Some cells contain explanation; code cells contain instructions for Python. You run one cell at a time, so you can inspect what happened before moving on.'],
      ['2 · Run your first cell', 'In Google Colab, click the ▶ button beside a code cell. Colab sends that cell to Python. The output appears directly underneath it. Running a cell does not automatically run every cell below it.'],
      ['3 · Read the output', 'print() is a simple way to ask Python to show a value. Output is evidence: it tells you what Python actually calculated, which may differ from what you expected.'],
      ['4 · Errors are information', 'A red traceback is Python explaining where execution failed. Start at the bottom, find the first line that points to your code, then inspect the variable named there. Do not change five things at once.'],
      ['5 · Imports and installs', 'import opens a Python library that is already installed. A command such as !pip install package-name asks Colab to install a missing library into the current runtime. Installing a library is different from importing it.'],
      ['6 · Files and runtime resets', 'A Colab runtime is temporary. Uploaded files and installed packages can disappear when the runtime resets. Your notebook is saved separately, so code may remain even when the temporary computer behind it is new.'],
      ['7 · CPU vs GPU', 'A CPU is enough for the early quests. Neural-network, CNN, LSTM and LoRA work can be faster on a GPU. In Colab use Runtime → Change runtime type → choose a GPU when one is available. A GPU does not make incorrect code correct.'],
      ['8 · Know what environment ran the code', 'Libraries change. When an advanced notebook behaves differently, record the library versions before assuming you made a mistake. Knowing the environment makes an experiment reproducible.']
    ];
    const bridges = [
      ['Graph bridge','A graph is a picture of paired measurements. Moving right means the horizontal quantity increased; moving up means the vertical quantity increased. One dot means one recorded pair. We graph data because patterns are often easier to see than in a table.','Model 1'],
      ['Rate / “per” bridge','“Per” means one quantity divided by another. 60 miles in 2 hours is 30 miles per hour. 10 N change across 0.39 V is about 25.6 N per volt. Slope is a rate of change.','Model 1'],
      ['Weighted-sum bridge','If vibration matters four times as strongly as temperature in a toy calculation, we can multiply each clue by a different number before adding them. Example: [2, 3] with weights [4, 1] gives 2×4 + 3×1 = 11. Those learned multipliers later get the name weights.','Model 7'],
      ['Vector bridge','A vector is simply an ordered list of numbers treated as one object. [temperature, vibration, torque] can represent one machine reading. The order matters because each position has a meaning.','Models 7, 11, 13'],
      ['Matrix bridge','A matrix is a rectangular table of numbers. It becomes useful when many weighted calculations must happen together. Neural-network code uses matrix multiplication because it can compute many neurons for many examples efficiently.','Models 7, 9, 11, 12'],
      ['Derivative / sensitivity bridge','Before the symbol, learn the question: “If I change this value a tiny amount, how much does the result change?” A derivative is a number that answers that sensitivity question. Gradients collect those sensitivities for many parameters.','Model 7'],
      ['Softmax bridge','Sometimes a model produces several raw class scores. We need a stable way to turn them into positive weights that add to 1. Softmax does that. The largest score usually gets the largest share, but the values are still model outputs that must be evaluated.','Models 7, 11'],
      ['Similarity bridge','If two vectors point in similar directions, they can represent similar patterns even when they are not identical. Modern text retrieval uses this idea to find document chunks whose meaning is close to a question.','Models 11, 13']
    ];
    return `<div class="v5-root mq11-basecamp"><main>
      <div class="mq11-base-head"><div><div class="v5-kicker">BASE CAMP · ABSOLUTE BEGINNER</div><h1>Before machine learning: make the computer predictable</h1><p>The goal is not to become a programmer or mathematician first. It is to know what you are clicking and to build each small idea before a later model depends on it.</p></div><button class="v5-btn" id="mq11BaseReturn">← Back to map</button></div>
      <section class="mq11-first-run"><div><div class="v5-kicker">TRY THE IDEA HERE</div><h2>A code cell is just an instruction you choose to run.</h2><pre>force_n = 25
print(force_n)</pre><button class="v5-btn primary" id="mq11FakeRun">▶ Run this fake practice cell</button></div><div class="mq11-output"><small>OUTPUT</small><strong id="mq11FakeOutput">Nothing yet — the cell has not run.</strong></div></section>
      <section class="mq11-base-grid">${steps.map((s,i)=>`<article class="mq11-base-card"><small>COMPUTER FOUNDATION ${i+1}/8</small><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</section>
      <div class="mq11-bridge-head"><div class="v5-kicker">MATH + REPRESENTATION BRIDGES</div><h2>These exist only because later models need them.</h2><p>No symbol is the starting point. Each bridge begins with the problem the idea solves.</p></div>
      <section class="mq11-base-grid">${bridges.map((s,i)=>`<article class="mq11-base-card mq11-bridge-card"><small>${esc(s[2])}</small><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</section>
      <section class="mq11-version-card"><div class="v5-kicker">ADVANCED QUESTS · VERSION CHECK</div><h3>When a package error appears, capture this before changing the lesson.</h3><pre>import sys
print('Python:', sys.version)

# Run only for libraries you actually use:
import sklearn
print('scikit-learn:', sklearn.__version__)</pre><p>This helps separate “I misunderstood the lesson” from “the software environment changed.”</p></section>
    </main></div>`;
  }

  function openBaseCamp(){
    const root = document.querySelector('#view');
    if(!root) return;
    document.querySelector('#homeHero')?.style && (document.querySelector('#homeHero').style.display='none');
    root.innerHTML = baseCampHTML();
    document.querySelector('#mq11FakeRun')?.addEventListener('click',()=>{
      const out=document.querySelector('#mq11FakeOutput'); if(out) out.textContent='25';
    });
    document.querySelector('#mq11BaseReturn')?.addEventListener('click',()=>{
      if(typeof showHome === 'function') showHome();
      else if(typeof window.ModelQuestV5?.showWorld === 'function') window.ModelQuestV5.showWorld();
      else location.reload();
    });
    scrollTo({top:0,behavior:'smooth'});
  }
  globalThis.MQ_OPEN_BASE_CAMP = openBaseCamp;

  function addTopEntry(){
    const top=document.querySelector('.topin');
    if(!top || top.querySelector('[data-mq11-basecamp]')) return;
    const b=document.createElement('button');
    b.className='btn'; b.dataset.mq11Basecamp='1'; b.textContent='Base Camp'; b.onclick=openBaseCamp;
    const search=top.querySelector('#searchOpen'); top.insertBefore(b,search || top.firstChild?.nextSibling);
  }

  function addMapEntry(){
    const actions=document.querySelector('.v5-map-actions');
    if(actions && !actions.querySelector('[data-mq11-basecamp]')){
      const b=document.createElement('button'); b.className='v5-btn v5-main-menu-btn'; b.dataset.mq11Basecamp='1'; b.textContent='Base Camp · start from zero'; b.onclick=openBaseCamp; actions.prepend(b);
    }
  }

  function addPrerequisiteStrip(){
    const id=currentId(), c=byId(id);
    if(!c || document.querySelector('.mq11-prereq')) return;
    const host=document.querySelector('.v5-quest-body') || document.querySelector('.v5-screen-head')?.parentElement;
    if(!host) return;
    const box=document.createElement('section'); box.className='mq11-prereq';
    box.innerHTML=`<div><small>BEFORE THIS QUEST</small><strong>${id===1?'Start from zero — no ML knowledge assumed.':'This quest builds on:'}</strong><div class="mq11-chips">${(c.prerequisites||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><button class="v5-btn" data-mq11-basecamp>Open Base Camp / bridges</button>`;
    box.querySelector('button').onclick=openBaseCamp;
    host.prepend(box);
  }

  function addCodeReadiness(){
    const id=currentId(), c=byId(id), grid=document.querySelector('.v5-code-grid');
    if(!c || !grid || document.querySelector('.mq11-code-readiness')) return;
    const guide=document.createElement('section'); guide.className='mq11-code-readiness';
    guide.innerHTML=`<article><small>WHY THIS CODE DESERVES TO EXIST</small><h3>Baseline first</h3><p>${esc(c.baseline)}</p></article><article><small>WHAT A HEALTHY RUN LOOKS LIKE</small><h3>Expected anchor</h3><p>${esc(c.expected)}</p></article><article><small>WHERE IT RUNS</small><h3>Environment</h3><p>${esc(c.environment)}</p></article>`;
    grid.parentElement.insertBefore(guide,grid);
  }

  function addTerminologyNote(){
    const id=currentId();
    if(!id || document.querySelector('.mq11-term-note')) return;
    const dataScreen=document.querySelector('.v5-data-grid');
    if(!dataScreen) return;
    const note=document.createElement('div'); note.className='mq11-term-note';
    note.innerHTML='<b>Vocabulary bridge:</b> In supervised ML, <em>target</em> and <em>label</em> both refer to the answer attached to a training example. “Target” is common for the value we want to predict; “label” is especially common for categories. ModelQuest will tell you when a different meaning matters.';
    dataScreen.appendChild(note);
  }

  function enhance(){ addTopEntry(); addMapEntry(); addPrerequisiteStrip(); addCodeReadiness(); addTerminologyNote(); }
  const mo=new MutationObserver(()=>enhance());
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{enhance();mo.observe(document.body,{childList:true,subtree:true});});
  else { enhance(); mo.observe(document.body,{childList:true,subtree:true}); }
})();
