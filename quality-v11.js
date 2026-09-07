/* ModelQuest v11 — beginner foundations, worked math, failure experiments and understanding checks. */
(() => {
  const byId = id => (globalThis.MQ_CURRICULUM || []).find(x => x.id === Number(id));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));

  function currentId(){
    const text = document.querySelector('.v5-quest-title .v5-kicker')?.textContent || document.querySelector('.eyebrow')?.textContent || '';
    const m = text.match(/MODEL\s+0?(\d+)/i);
    return m ? Number(m[1]) : null;
  }
  function activeStep(){ return (document.querySelector('.v5-step.active b')?.textContent || '').trim().toUpperCase(); }

  const ANCHORS={
    1:'Typical run: Baseline MAE ≈ 12.00 N; slope ≈ 25.57 N/V; model MAE ≈ 0.17 N; 1.05 V → ≈ 26.01 N.',
    2:'With the fixed seed, threshold 0.50 gives failure recall around 0.68; lowering it to 0.35 raises recall to about 0.78 while false rejects increase.',
    3:'With the fixed seed, the deliberately unscaled KNN is around 0.90 test accuracy; scaling repairs it to about 1.00 on this deliberately simple synthetic dataset.',
    4:'Typical run: majority baseline ≈ 0.51; depth 5 test accuracy ≈ 0.81; a fully grown tree reaches 1.00 training accuracy but only about 0.79 test accuracy.',
    5:'Typical run: honest forest ≈ 0.94 accuracy and ≈ 0.62 failure recall; adding future_repair_flag produces a suspicious 1.00 / 1.00 result.',
    6:'Typical silhouettes: K=2 ≈ 0.68, K=3 ≈ 0.68, K=4 ≈ 0.52, then generally lower as the three broad modes are fragmented.',
    7:'Exact neural-network accuracy can vary slightly by TensorFlow/runtime. The important check is that the code runs, loss decreases, and the MLP is compared with the printed linear baseline.',
    8:'Exact scores can vary by scikit-learn version. Compare old-batch and shifted-batch scores across regularization values rather than expecting one magic number.',
    9:'The synthetic defect dataset is intentionally easy. A tiny CNN should rise far above the 0.333 chance baseline within a few epochs.',
    10:'First compare the printed persistence MAE with the LSTM MAE. A successful experiment should be in the same ballpark or better after a few epochs; exact values can vary.',
    11:'Attention numbers vary by pretrained model/head. A healthy run prints the focus token “hot” and several tokens with numeric attention weights.',
    12:'A healthy run prints that only a small fraction of parameters are trainable. The tiny model may generate poor prose; that is not the learning objective.',
    13:'A healthy run should retrieve the bearing service bulletin near rank 1 for the >85 C bearing question. Inspect retrieval order before judging any generated wording.'
  };

  const WORKED={
    1:{title:'From two measurements to slope',why:'We need one number that says how much force changes when voltage changes.',steps:['Voltage change: 0.81 − 0.42 = 0.39 V','Force change: 20 − 10 = 10 N','Rate: 10 ÷ 0.39 ≈ 25.6 N/V','That rate of change is called slope.'],formula:'slope = change in force ÷ change in voltage',take:'The unit N/V is part of the meaning: about 25.6 newtons for each additional volt.'},
    2:{title:'From a raw score to a bounded decision score',why:'PASS/FAIL needs a score that stays between 0 and 1 before a threshold turns it into a decision.',steps:['Suppose the model’s raw score is z = 0.8.','e^(−0.8) ≈ 0.45.','1 ÷ (1 + 0.45) ≈ 0.69.','At threshold 0.50 this becomes FAIL; at threshold 0.75 it becomes PASS.'],formula:'p = 1 ÷ (1 + e^(−z))',take:'The threshold changes the decision, not the underlying model score.'},
    3:{title:'Turn “near” into a number',why:'A computer cannot rely on “these dots look close.” It needs a repeatable distance calculation.',steps:['New reading: (2, 70). Stored reading: (3, 74).','Differences: 3−2 = 1 and 74−70 = 4.','Square and add: 1² + 4² = 17.','Distance: √17 ≈ 4.12.'],formula:'distance = √[(difference 1)² + (difference 2)²]',take:'If one feature is multiplied by 1000, its difference dominates this calculation unless we scale features.'},
    4:{title:'Measure how mixed a tree node is',why:'A tree needs a number for deciding whether one split creates cleaner groups than another.',steps:['Suppose a node has 8 LATE and 2 ON-TIME shipments.','Fractions are 0.8 and 0.2.','Square them: 0.64 and 0.04.','Gini = 1 − (0.64 + 0.04) = 0.32.'],formula:'Gini = 1 − sum of each class fraction squared',take:'A pure node has Gini 0. Lower means less mixed, not automatically “more causal.”'},
    5:{title:'Why many trees can vote',why:'One tree can be unstable. Combining different trees can make the final decision less dependent on one odd set of splits.',steps:['Five trees vote: FAIL, FAIL, HEALTHY, FAIL, HEALTHY.','FAIL receives 3 votes. HEALTHY receives 2.','The forest predicts FAIL by majority vote.','If all five trees were identical copies, the vote would add no new information.'],formula:'forest prediction = combine many tree predictions',take:'Diversity is why the committee can help. Leakage can still make the whole committee confidently wrong.'},
    6:{title:'Move a centroid to the group average',why:'K-Means needs one representative center for each temporary group.',steps:['Two points are (1,2) and (3,4).','Average x: (1+3) ÷ 2 = 2.','Average y: (2+4) ÷ 2 = 3.','The new centroid is (2,3).'],formula:'centroid = average position of the points assigned to the cluster',take:'K-Means repeats assignment and averaging. It will still produce exactly K clusters even when K has no physical meaning.'},
    7:{title:'Build one neuron before building a network',why:'We need adjustable influence so vibration can matter more than temperature.',steps:['Inputs: temperature clue = 0.5, vibration clue = 1.2.','Weights: 0.4 and 1.5. Bias: −0.2.','Weighted sum: 0.5×0.4 + 1.2×1.5 − 0.2 = 1.8.','ReLU keeps positive 1.8 as 1.8.'],formula:'neuron output = activation(weighted inputs + bias)',take:'A weight is not mysterious: it is a learned multiplier. Many such calculations chained together form a network.'},
    8:{title:'See what regularization adds to the objective',why:'If a flexible model uses extreme weights to fit old data, we can deliberately make extreme solutions cost more.',steps:['Prediction/data loss = 0.30.','Two toy weights are 2 and 1, so squared-weight sum = 4 + 1 = 5.','Let regularization strength λ = 0.10. Penalty = 0.10×5 = 0.50.','Total objective = 0.30 + 0.50 = 0.80.'],formula:'total loss = data loss + regularization penalty',take:'Regularization trades some old-data fit for a less extreme solution. It cannot repair a genuinely changed future world.'},
    9:{title:'Compute one convolution response by hand',why:'A CNN needs a repeatable way to ask whether a small local pattern is present.',steps:['Image patch = [[1,0],[1,0]].','Filter = [[1,−1],[1,−1]].','Multiply matching cells: 1×1 + 0×(−1) + 1×1 + 0×(−1).','Add them: response = 2.'],formula:'one feature value = multiply patch by filter cell-by-cell, then add',take:'The same small filter slides across the image, so one learned pattern can be detected in many locations.'},
    10:{title:'Update a tiny memory state',why:'Sequence models need a controlled way to keep some old information and add some new information.',steps:['Old memory = 0.8. Forget amount = 0.75.','Kept old memory: 0.75×0.8 = 0.60.','New candidate = 0.5 and input amount = 0.4, so added memory = 0.20.','New memory = 0.60 + 0.20 = 0.80.'],formula:'new memory = kept old memory + admitted new memory',take:'The gate names come after the need: decide what to retain and what new information to admit.'},
    11:{title:'Turn attention scores into a weighted mix',why:'A token needs a principled way to use more information from relevant tokens and less from irrelevant ones.',steps:['Suppose two relevance scores are 2 and 1.','Softmax turns them into about 0.73 and 0.27.','Suppose their simple value numbers are 10 and 2.','Weighted mix: 0.73×10 + 0.27×2 ≈ 7.84.'],formula:'attention = normalized relevance weights × information values',take:'Real attention uses vectors and matrices, but the core idea is still “compare relevance, normalize, mix information.”'},
    12:{title:'Why low rank can save trainable parameters',why:'Full fine-tuning changes a huge matrix; LoRA asks whether a much smaller update can express the needed adaptation.',steps:['Imagine a 1000×1000 weight matrix: 1,000,000 values.','Rank 8 LoRA uses one 8×1000 matrix and one 1000×8 matrix.','Trainable adapter values: 8,000 + 8,000 = 16,000.','16,000 is 1.6% of 1,000,000 in this toy example.'],formula:'LoRA update ≈ small matrix B × small matrix A',take:'Higher rank adds adapter capacity and trainable parameters. It does not guarantee better behavior.'},
    13:{title:'Why semantic retrieval can pick the right chunk',why:'RAG needs a number for how closely the meaning of a question matches each chunk.',steps:['Toy normalized question vector: [0.8, 0.6].','Relevant chunk vector: [0.8, 0.6]. Dot product = 1.00.','Unrelated chunk vector: [0.6, −0.8]. Dot product = 0.00.','Top-K ranking places the higher-similarity chunk first.'],formula:'similarity score = normalized question vector · normalized chunk vector',take:'If retrieval selects the wrong evidence, changing the generator cannot repair evidence it never received.'}
  };

  const FAILURE={
    1:{name:'Suspicious calibration point',good:'Clean calibration: one straight line leaves only small residuals.',bad:'Add one badly measured force value: the fitted line rotates/shifts and predictions elsewhere move.',why:'Squared-error fitting gives large residuals strong influence. Re-measure and investigate units/fixture before deleting data.'},
    2:{name:'Accuracy trap with rare defects',good:'Balanced inspection data: accuracy roughly reflects both classes.',bad:'99 good parts + 1 defective part: “always PASS” is 99% accurate while catching 0% of defects.',why:'When one class is rare, total accuracy can hide the exact failure you care about. Inspect recall/precision and error cost.'},
    3:{name:'Distance distorted by units',good:'Comparable feature scales let vibration and temperature both influence distance.',bad:'Multiply temperature by 1000: temperature dominates distance and changes the nearest neighbors.',why:'The machine did not change; only the numerical geometry did. Scaling repairs the representation.'},
    4:{name:'Tree memorization',good:'Moderate depth captures repeatable shipment rules.',bad:'Grow until training accuracy reaches ~100%: unseen performance can flatten or fall.',why:'Extra branches can encode quirks that do not repeat. Training fit alone is not the goal.'},
    5:{name:'Future-information leakage',good:'Honest features produce a realistic, imperfect maintenance score.',bad:'Add future_repair_flag from after the outcome: validation jumps to suspiciously perfect performance.',why:'The model is being shown part of the answer. A lower honest score is more useful than a leaked perfect one.'},
    6:{name:'Forced clusters',good:'K near the broad telemetry structure creates compact, interpretable groups.',bad:'Set K=8: the algorithm still returns eight clusters even though the synthetic process has only three broad modes.',why:'K-Means obeys K. It does not prove the physical machine has K real states.'},
    7:{name:'Unstable learning rate',good:'A moderate step size reduces loss over repeated updates.',bad:'A very large step can jump past a good region and make loss oscillate or grow.',why:'The gradient gives a direction; the learning rate decides how far to move. Direction alone does not choose a safe step size.'},
    8:{name:'Overfitting vs world change',good:'A model performs similarly on old and genuinely comparable unseen data.',bad:'Old-data score stays high while a shifted supplier batch performs worse.',why:'Overfitting means learning old quirks; distribution shift means the future data itself changed. They can require different fixes.'},
    9:{name:'Visual shortcut',good:'Defect pattern is the only reliable visual clue.',bad:'All scratch images accidentally have darker backgrounds: the CNN can learn lighting instead of scratches.',why:'A high test score is meaningless if train/test share the same shortcut. Vary plausible lighting and inspect failures.'},
    10:{name:'Future leakage in time series',good:'Train on earlier time and test on later time.',bad:'Randomly shuffle future samples into training: the evaluation may become unrealistically easy.',why:'Time order is part of the problem. Future information must not help predict the past.'},
    11:{name:'Attention mistaken for explanation',good:'Attention is inspected as one internal weighting mechanism.',bad:'A thick attention arc is treated as proof that the model “reasoned” exactly like a person.',why:'Attention weights show information mixing, not guaranteed causal explanation of a model decision.'},
    12:{name:'Rank as a magic quality knob',good:'Use a small rank that is sufficient for the adaptation behavior.',bad:'Increase rank automatically and assume more trainable parameters must improve results.',why:'Rank adds capacity and cost. Data quality, task fit and evaluation still decide whether the adaptation is useful.'},
    13:{name:'Bad retrieval, fluent answer',good:'Relevant chunks are retrieved and inspected before generation.',bad:'Irrelevant chunks enter context; a generator still produces confident fluent prose.',why:'RAG starts with evidence quality. Diagnose retrieval before tuning the generator.'}
  };

  const GATES={
    1:{q:'Why is a straight line a sensible first model for the calibration data?',o:['Because ML always starts with a line.','Because similar voltage increases produce similar force increases, suggesting an approximately constant rate.','Because a curve cannot make numeric predictions.'],a:1,why:'A line represents a constant rate of change. The data pattern creates the reason to try it.'},
    2:{q:'What changes when you lower only the decision threshold?',o:['The model is retrained with new weights.','The stored feature values change.','More cases are labeled FAIL even though their model scores stay the same.'],a:2,why:'A threshold is a decision rule applied after the score is produced.'},
    3:{q:'Why can feature scaling change KNN predictions?',o:['It changes the physical sensor readings.','It changes the numerical distances used to decide which examples are near.','It creates more training examples.'],a:1,why:'KNN reasons through distance, so numerical scale changes geometry.'},
    4:{q:'A depth-12 tree has higher training accuracy but lower test accuracy than depth 5. What is the most likely explanation?',o:['The deeper tree may be memorizing training quirks.','The test set must be wrong.','A deeper tree always needs more features.'],a:0,why:'More capacity can improve training fit after it stops improving unseen performance.'},
    5:{q:'Why is a perfect score after adding future_repair_flag bad news?',o:['Random Forest cannot score 1.0.','The feature contains information unavailable at real prediction time.','Perfect scores are mathematically impossible.'],a:1,why:'Leakage makes evaluation dishonest even when the code runs correctly.'},
    6:{q:'K-Means returns eight clusters when K=8. What have we proved?',o:['The machine definitely has eight physical modes.','Only that the algorithm partitioned the data into eight groups under that objective.','That PCA should also use eight components.'],a:1,why:'The requested K is an instruction to the algorithm, not a discovery guarantee.'},
    7:{q:'What does a neural-network weight do at the most basic level?',o:['It multiplies an incoming signal and changes that signal’s influence.','It stores the training dataset.','It decides how many epochs to train.'],a:0,why:'Weights begin as learned multipliers. The complex network is built from many simple weighted calculations.'},
    8:{q:'If a supplier changes material properties, is stronger regularization guaranteed to fix the problem?',o:['Yes, regularization fixes every generalization problem.','No, the data distribution may have changed and new representative data may be needed.','Yes, if training accuracy is high enough.'],a:1,why:'Regularization addresses model fitting behavior; it cannot make missing future conditions appear in training data.'},
    9:{q:'Why does a convolution filter slide across the image?',o:['So the same local pattern can be detected in different locations.','To turn the image into text.','Because every pixel needs a different model.'],a:0,why:'Weight sharing lets one local detector be reused across space.'},
    10:{q:'Why is random train/test splitting risky for forecasting?',o:['LSTMs require alphabetic order.','Future observations can leak into training and make evaluation unrealistically easy.','Random splitting always reduces dataset size.'],a:1,why:'Forecasting is directional in time; future information should not help train predictions of earlier periods.'},
    11:{q:'What problem does attention solve first?',o:['It lets each token selectively use information from other tokens in the current context.','It guarantees explanations of every model decision.','It stores an entire database inside one token.'],a:0,why:'Attention is dynamic information weighting between token representations.'},
    12:{q:'Why use LoRA instead of automatically fine-tuning every base-model weight?',o:['LoRA can adapt behavior while training far fewer parameters.','LoRA guarantees factual correctness.','Full fine-tuning cannot change model behavior.'],a:0,why:'Parameter efficiency is the reason LoRA exists; it is not a truth or quality guarantee.'},
    13:{q:'A RAG answer is wrong. What should you inspect first?',o:['Increase generator temperature.','Retrieved chunks and their relevance to the question.','Make the answer longer.'],a:1,why:'If the evidence is missing or wrong, the generator never had the correct material to ground the answer.'}
  };

  function baseCampHTML(){
    const steps=[
      ['1 · What is a notebook?','A notebook is a document made of small blocks called cells. Explanation and code can sit next to each other. You choose which code cell to run.'],
      ['2 · Run your first cell','In Google Colab, click the ▶ button beside a code cell. Output appears directly underneath that cell.'],
      ['3 · Read the output','print() asks Python to show a value. Output is evidence of what actually happened, not what you hoped happened.'],
      ['4 · Errors are information','Start a traceback at the bottom. Find the first line pointing to your code, inspect that variable, and change one thing at a time.'],
      ['5 · Imports and installs','import opens an installed library. !pip install asks the current Colab runtime to install a missing package. Those are different actions.'],
      ['6 · Files and runtime resets','A Colab runtime is temporary. Uploaded files and installed packages may disappear after a reset even while notebook code remains saved.'],
      ['7 · CPU vs GPU','Early quests only need CPU. For heavier neural work: Runtime → Change runtime type → GPU when available. A GPU makes computation faster, not reasoning more correct.'],
      ['8 · Record the environment','Libraries change. Record Python/library versions when advanced code behaves differently so you can separate learner mistakes from environment changes.']
    ];
    const bridges=[
      ['Graph bridge','A graph is a picture of paired measurements. One dot means one recorded pair. Right means the horizontal quantity increased; up means the vertical quantity increased.','Model 1'],
      ['Rate / “per” bridge','“Per” means divide one quantity by another. 10 N across 0.39 V is about 25.6 N per volt. Slope is a rate of change.','Model 1'],
      ['Weighted-sum bridge','If one clue should matter more, multiply clues by different numbers before adding them. [2,3] with weights [4,1] gives 2×4 + 3×1 = 11.','Model 7'],
      ['Vector bridge','A vector is an ordered list of numbers treated as one object. [temperature, vibration, torque] can represent one machine reading.','Models 7, 11, 13'],
      ['Matrix bridge','A matrix is a rectangular table of numbers. Matrix multiplication lets many weighted calculations happen together.','Models 7, 9, 11, 12'],
      ['Derivative / sensitivity bridge','Ask first: “If I change this value a tiny amount, how much does the result change?” A derivative answers that sensitivity question.','Model 7'],
      ['Softmax bridge','Several raw class scores need to become positive weights that add to 1. Softmax performs that conversion.','Models 7, 11'],
      ['Similarity bridge','Numerical vectors can be compared for similarity. Text retrieval uses this to rank document chunks by meaning relative to a question.','Models 11, 13']
    ];
    return `<div class="v5-root mq11-basecamp"><main>
      <div class="mq11-base-head"><div><div class="v5-kicker">BASE CAMP · ABSOLUTE BEGINNER</div><h1>Before machine learning: make the computer predictable</h1><p>The goal is not to become a programmer or mathematician first. It is to build every small idea before a later model depends on it.</p></div><button class="v5-btn" id="mq11BaseReturn">← Back to map</button></div>
      <section class="mq11-first-run"><div><div class="v5-kicker">TRY THE IDEA HERE</div><h2>A code cell is an instruction you choose to run.</h2><pre>force_n = 25\nprint(force_n)</pre><button class="v5-btn primary" id="mq11FakeRun">▶ Run this fake practice cell</button></div><div class="mq11-output"><small>OUTPUT</small><strong id="mq11FakeOutput">Nothing yet — the cell has not run.</strong></div></section>
      <section class="mq11-base-grid">${steps.map((s,i)=>`<article class="mq11-base-card"><small>COMPUTER FOUNDATION ${i+1}/8</small><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</section>
      <div class="mq11-bridge-head"><div class="v5-kicker">MATH + REPRESENTATION BRIDGES</div><h2>These ideas exist because later models need them.</h2><p>No symbol is the starting point. Begin with the problem the idea solves.</p></div>
      <section class="mq11-base-grid">${bridges.map(s=>`<article class="mq11-base-card mq11-bridge-card"><small>${esc(s[2])}</small><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></article>`).join('')}</section>
      <section class="mq11-version-card"><div class="v5-kicker">ADVANCED QUESTS · VERSION CHECK</div><h3>Capture the environment before changing working lesson code.</h3><pre>import sys\nprint('Python:', sys.version)\n\nimport sklearn\nprint('scikit-learn:', sklearn.__version__)</pre><p>This helps separate “I misunderstood the lesson” from “the software environment changed.”</p></section>
    </main></div>`;
  }

  function openBaseCamp(){
    const root=document.querySelector('#view'); if(!root)return;
    const hero=document.querySelector('#homeHero'); if(hero) hero.style.display='none';
    root.innerHTML=baseCampHTML();
    document.querySelector('#mq11FakeRun')?.addEventListener('click',()=>{const out=document.querySelector('#mq11FakeOutput');if(out)out.textContent='25';});
    document.querySelector('#mq11BaseReturn')?.addEventListener('click',()=>{if(typeof showHome==='function')showHome();else location.reload();});
    scrollTo({top:0,behavior:'smooth'});
  }
  globalThis.MQ_OPEN_BASE_CAMP=openBaseCamp;

  function addTopEntry(){
    const top=document.querySelector('.topin'); if(!top||top.querySelector('[data-mq11-basecamp]'))return;
    const b=document.createElement('button'); b.className='btn'; b.dataset.mq11Basecamp='1'; b.textContent='Base Camp'; b.onclick=openBaseCamp;
    const search=top.querySelector('#searchOpen'); top.insertBefore(b,search||top.firstChild?.nextSibling);
  }
  function addMapEntry(){
    const actions=document.querySelector('.v5-map-actions'); if(!actions||actions.querySelector('[data-mq11-basecamp]'))return;
    const b=document.createElement('button'); b.className='v5-btn v5-main-menu-btn'; b.dataset.mq11Basecamp='1'; b.textContent='Base Camp · start from zero'; b.onclick=openBaseCamp; actions.prepend(b);
  }
  function addPrerequisiteStrip(){
    const id=currentId(),c=byId(id); if(!c||document.querySelector('.mq11-prereq'))return;
    const host=document.querySelector('.v5-quest-body')||document.querySelector('.v5-screen-head')?.parentElement; if(!host)return;
    const box=document.createElement('section'); box.className='mq11-prereq';
    box.innerHTML=`<div><small>BEFORE THIS QUEST</small><strong>${id===1?'Start from zero — no ML knowledge assumed.':'This quest builds on:'}</strong><div class="mq11-chips">${(c.prerequisites||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><button class="v5-btn">Open Base Camp / bridges</button>`;
    box.querySelector('button').onclick=openBaseCamp; host.prepend(box);
  }
  function addCodeReadiness(){
    const id=currentId(),c=byId(id),grid=document.querySelector('.v5-code-grid'); if(!c||!grid||document.querySelector('.mq11-code-readiness'))return;
    const guide=document.createElement('section'); guide.className='mq11-code-readiness';
    guide.innerHTML=`<article><small>BASELINE FIRST</small><h3>What must ML beat?</h3><p>${esc(c.baseline)}</p></article><article><small>EXPECTED OUTPUT</small><h3>Sanity-check anchor</h3><p>${esc(ANCHORS[id]||c.expected)}</p></article><article><small>WHERE IT RUNS</small><h3>Environment</h3><p>${esc(c.environment)}</p></article>`;
    grid.parentElement.insertBefore(guide,grid);
  }
  function addTerminologyNote(){
    const id=currentId(); if(!id||document.querySelector('.mq11-term-note'))return;
    const dataScreen=document.querySelector('.v5-data-grid'); if(!dataScreen)return;
    const note=document.createElement('div'); note.className='mq11-term-note';
    note.innerHTML='<b>Vocabulary bridge:</b> In supervised ML, <em>target</em> and <em>label</em> both refer to the answer attached to a training example. “Target” is common for the value to predict; “label” is especially common for categories.';
    dataScreen.appendChild(note);
  }
  function addWorkedMath(){
    const id=currentId(),w=WORKED[id],step=activeStep(); if(!w||!step.includes('MATH')||document.querySelector('.mq11-worked'))return;
    const host=document.querySelector('.v5-quest-body')||document.querySelector('.v5-screen-head')?.parentElement; if(!host)return;
    const box=document.createElement('section'); box.className='mq11-worked';
    box.innerHTML=`<div class="v5-kicker">NUMBERS BEFORE SYMBOLS</div><h2>${esc(w.title)}</h2><p class="mq11-why"><b>Why this calculation exists:</b> ${esc(w.why)}</p><div class="mq11-worked-steps">${w.steps.map((x,i)=>`<div><span>${i+1}</span><p>${esc(x)}</p></div>`).join('')}</div><div class="mq11-formula"><small>ONLY NOW NAME THE FORMULA</small><strong>${esc(w.formula)}</strong></div><p class="mq11-take"><b>What to carry forward:</b> ${esc(w.take)}</p>`;
    host.appendChild(box);
  }
  function addFailureExperiment(){
    const id=currentId(),f=FAILURE[id],step=activeStep(); if(!f||!(/WHEN|REALITY/.test(step))||document.querySelector('.mq11-failure'))return;
    const host=document.querySelector('.v5-quest-body')||document.querySelector('.v5-screen-head')?.parentElement; if(!host)return;
    const box=document.createElement('section'); box.className='mq11-failure';
    box.innerHTML=`<div class="v5-kicker">BREAK IT ON PURPOSE</div><h2>${esc(f.name)}</h2><p>First inspect the healthy setup. Then introduce one failure and compare what changes.</p><div class="mq11-failure-buttons"><button class="v5-btn primary" data-state="good">Healthy setup</button><button class="v5-btn" data-state="bad">Break it</button></div><div class="mq11-failure-output"><small>OBSERVE</small><strong>${esc(f.good)}</strong><p>${esc(f.why)}</p></div>`;
    const out=box.querySelector('.mq11-failure-output strong');
    box.querySelectorAll('[data-state]').forEach(btn=>btn.onclick=()=>{box.querySelectorAll('[data-state]').forEach(x=>x.classList.toggle('primary',x===btn));out.textContent=btn.dataset.state==='bad'?f.bad:f.good;});
    host.appendChild(box);
  }
  function addGate(){
    const id=currentId(),g=GATES[id],step=activeStep(); if(!g||!(/PROVE|CHALLENGE/.test(step))||document.querySelector('.mq11-gate'))return;
    const host=document.querySelector('.v5-challenge')||document.querySelector('.v5-quest-body'); if(!host)return;
    const box=document.createElement('section'); box.className='mq11-gate';
    box.innerHTML=`<div class="v5-kicker">UNDERSTANDING CHECK</div><h3>${esc(g.q)}</h3><div class="mq11-gate-options">${g.o.map((x,i)=>`<button class="v5-btn" data-answer="${i}">${esc(x)}</button>`).join('')}</div><div class="mq11-gate-feedback" hidden></div>`;
    const feedback=box.querySelector('.mq11-gate-feedback');
    box.querySelectorAll('[data-answer]').forEach(btn=>btn.onclick=()=>{const ok=Number(btn.dataset.answer)===g.a;box.querySelectorAll('[data-answer]').forEach(x=>x.classList.remove('mq11-correct','mq11-wrong'));btn.classList.add(ok?'mq11-correct':'mq11-wrong');feedback.hidden=false;feedback.innerHTML=`<b>${ok?'Yes — the mental model is sound.':'Not yet — this is the misconception to fix.'}</b><p>${esc(g.why)}</p>${ok?'':'<button class="v5-btn" data-review>Review the prerequisite bridges</button>'}`;feedback.querySelector('[data-review]')?.addEventListener('click',openBaseCamp);});
    host.prepend(box);
  }

  function enhance(){addTopEntry();addMapEntry();addPrerequisiteStrip();addCodeReadiness();addTerminologyNote();addWorkedMath();addFailureExperiment();addGate();}
  const mo=new MutationObserver(()=>enhance());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{enhance();mo.observe(document.body,{childList:true,subtree:true});});
  else{enhance();mo.observe(document.body,{childList:true,subtree:true});}
})();
