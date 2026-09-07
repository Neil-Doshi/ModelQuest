/* ModelQuest v7 — Python primer, recall checkpoints, boss feedback, region meaning, equations, and engineering context. */
(()=>{
const V7={enhancing:false};

const PYTHON=[
  {
    title:'1 · Variables — give a value a useful name',
    analogy:'A variable is like putting a label on a measurement so you can use it again without remembering the raw number.',
    body:'In engineering you might measure force, temperature, pressure, or RPM. Python lets you store that value under a name. The equals sign here does not mean “these two things are mathematically equal forever.” It means “evaluate the value on the right and store it under the name on the left.” If the value changes later, the same name can point to the new measurement.',
    code:'force_n = 25\ntemperature_c = 68.4\nprint(force_n)  # 25',
    challenge:'If force_n = 25 and you write force_n = force_n + 5, what will force_n become?',
    answer:'30. Python reads the old value, adds 5, then stores the new value back under the same name.'
  },
  {
    title:'2 · Lists and arrays — keep many measurements together',
    analogy:'Instead of writing five sensor readings on five loose sticky notes, put them into one labeled tray.',
    body:'A Python list stores several values in order. Machine-learning code often converts lists into NumPy arrays because arrays are designed for fast numerical calculations over many values at once. The square brackets describe a collection; the number inside voltage[0] selects one position from that collection.',
    code:'voltage = [0.42, 0.81, 1.22, 1.60]\nprint(voltage[0])  # first item -> 0.42\n\nimport numpy as np\nx = np.array(voltage)',
    challenge:'Why is voltage[0] the first value instead of voltage[1]?',
    answer:'Python counts positions from 0. The first slot is index 0, the second is index 1, and so on.'
  },
  {
    title:'3 · Conditions — let the program make a simple decision',
    analogy:'An if statement is like an inspection rule: if vibration exceeds a limit, flag the machine; otherwise continue normally.',
    body:'Conditions let code choose different actions based on a true-or-false test. The colon begins the block and indentation shows which lines belong to that decision. ML models learn patterns from data, but ordinary if/else rules are still useful for safety limits, validation, and post-processing model outputs.',
    code:'vibration = 5.2\n\nif vibration > 4.0:\n    print("inspect machine")\nelse:\n    print("continue running")',
    challenge:'If vibration becomes 3.1, which message will print?',
    answer:'“continue running” because 3.1 > 4.0 is false, so Python follows the else branch.'
  },
  {
    title:'4 · Loops — repeat the same operation',
    analogy:'If you need to inspect 100 bolts, you do not invent a different inspection process for every bolt. You repeat the same steps.',
    body:'A loop tells Python to repeat a block of code for each item. The indented lines belong to the loop. In ML, libraries usually perform the heavy numerical loops internally, but understanding the idea helps you read data-processing and evaluation code.',
    code:'forces = [10, 20, 30]\nfor force in forces:\n    print(force * 2)',
    challenge:'How many times will print() run in this example?',
    answer:'Three times — once for each value in forces.'
  },
  {
    title:'5 · Functions — package a reusable procedure',
    analogy:'A function is like a test procedure: give it inputs, follow the same steps, and get a result back.',
    body:'Functions prevent repeated code and make a calculation easier to understand. def creates the function, the names inside parentheses are parameters, and return sends a result back. You can then call the same procedure with different sensor readings without rewriting the calculation.',
    code:'def force_from_voltage(voltage, slope, intercept):\n    return slope * voltage + intercept\n\nprint(force_from_voltage(1.05, 25.6, -0.7))',
    challenge:'Which three values are inputs to force_from_voltage?',
    answer:'voltage, slope, and intercept. The function combines those inputs and returns one predicted force.'
  },
  {
    title:'6 · Imports — open a toolbox somebody already built',
    analogy:'Python is the workshop. A library is a toolbox. import puts that toolbox on your bench so you can use its tools.',
    body:'NumPy, scikit-learn, TensorFlow, PyTorch, and Transformers are libraries. “as np” is only a nickname. Importing a library does not train a model; it only makes reusable code available. “from ... import ...” means you are taking one specific tool out of that toolbox.',
    code:'import numpy as np\nfrom sklearn.linear_model import LinearRegression\n\n# np is a short nickname for numpy\n# LinearRegression is one tool imported from scikit-learn',
    challenge:'What does np mean in np.array([1, 2, 3])?',
    answer:'It is simply the nickname assigned to NumPy by “import numpy as np”.'
  }
];

const REGIONS={
  'Prediction Valley':'Start with the simplest question: can measurements predict a number or a probability? This region builds the ideas of inputs, outputs, error, model fit, and decision thresholds.',
  'Decision Woods':'Learn models that reason through similarity, separating boundaries, and if/else-like decisions. The goal is to see how different model structures can solve classification problems.',
  'Ensemble Forest':'One model can be unstable. This region combines many models and introduces predictive-maintenance issues such as rare failures, leakage, and asymmetric mistakes.',
  'Discovery Islands':'Sometimes nobody has labeled the answer. Here the goal is to discover structure, clusters, and simpler views of high-dimensional machine telemetry.',
  'Neural Highlands':'Move from hand-readable models to networks that learn many interacting weights. Gradient-based training, capacity, generalization, and regularization become central.',
  'Vision Ridge':'Images are structured grids, not ordinary tables. Learn how convolutional networks detect local patterns such as scratches, pits, textures, and surface defects.',
  'Memory Pass':'Measurements arrive in time order. Learn why sequence history matters and how recurrent memory can help forecast equipment behavior.',
  'Attention City':'Text and modern language models live here. Learn tokens, embeddings, attention, and why context changes what a word or maintenance note means.',
  'AI Forge':'Adapt a pretrained model without retraining everything. LoRA and parameter-efficient fine-tuning show how modern models can be customized on realistic hardware.',
  'Final Frontier':'Combine retrieval and generation into an engineering copilot that can search manuals and service records, answer with evidence, and expose its failure modes.'
};

const BOSS={
  1:{what:'A single suspicious calibration point can rotate or shift the fitted line, increasing residuals and changing predictions elsewhere.',why:'Ordinary least-squares regression gives large errors strong influence because the errors are squared. Do not automatically delete a strange point: first verify the measurement, units, fixture, sensor range, and whether it represents a real operating condition.'},
  2:{what:'Lowering the decision threshold usually catches more real failures, but it also turns more borderline good parts into FAIL predictions.',why:'The model scores do not change. Only the cutoff changes. A lower cutoff often raises recall while reducing precision, so the right threshold depends on the cost of a missed defect versus a false reject.'},
  3:{what:'If temperature is multiplied by 1000 and you do not scale features, distance calculations become dominated by temperature.',why:'KNN and many SVM settings care about geometry. A feature with a much larger numeric scale can drown out vibration or load even when those features are physically important.'},
  4:{what:'A very deep tree can reach perfect or near-perfect training accuracy while unseen-shipment accuracy gets worse.',why:'Each extra split can capture quirks of the training records. The shallowest tree that performs well on unseen data is usually more trustworthy than a tree that memorizes every training case.'},
  5:{what:'Adding a future repair flag can make validation scores jump dramatically even though the deployable model has not become smarter.',why:'That feature leaks information from after the event. The model is effectively being shown part of the answer. A lower honest score is more valuable than a spectacular leaked score.'},
  6:{what:'K-Means will return exactly the k clusters you request, including eight clusters even when only a few operating modes are physically meaningful.',why:'The algorithm optimizes a mathematical objective; it does not prove that every cluster corresponds to a real machine state. Domain interpretation, stability checks, and visual inspection are still required.'},
  7:{what:'Too few hidden neurons may underfit; far more neurons increase capacity and parameters without guaranteeing better unseen-data performance.',why:'Network capacity must match the pattern and the amount of data. More neurons create more flexible boundaries, but also more ways to fit noise.'},
  8:{what:'A model can keep improving on the old production batch while performance on the new batch stalls or falls.',why:'Training accuracy measures performance on the training distribution. Regularization and validation help, but a genuine batch or supplier shift may require better data, monitoring, or retraining.'},
  9:{what:'A useful convolution filter activates strongly where its learned local pattern appears. Pooling reduces spatial resolution while keeping strong responses.',why:'CNNs reuse small filters across the image, allowing them to detect the same defect pattern in many locations instead of learning a separate rule for every pixel.'},
  10:{what:'A very short history window can miss slow trends; a very long window can add noise, cost, and harder training.',why:'Sequence models only receive the context you give them. Window size should reflect the physical timescale of the process and must be evaluated without leaking future measurements.'},
  11:{what:'Changing a maintenance note changes which tokens attend to which other tokens and therefore changes their contextual representations.',why:'Attention is recomputed from the current sequence. It is dynamic context weighting, not a fixed dictionary of word meanings and not proof of human-style reasoning.'},
  12:{what:'Increasing LoRA rank increases adapter capacity and trainable parameters; quantization can reduce memory but introduces compatibility and quality tradeoffs.',why:'LoRA is efficient because the large base model stays mostly frozen. The adapter should be large enough for the task, not automatically as large as possible.'},
  13:{what:'Increasing top-k retrieves more chunks, but after a point the answer can become worse because irrelevant material crowds the useful evidence.',why:'RAG quality begins with retrieval. Chunk size, embeddings, metadata filters, top-k, reranking, and grounding determine whether the language model receives the right evidence.'}
};

const CHECKPOINTS={
  4:[
    ['Why can scaling matter for KNN even though it does not change the physical machine?','Scaling changes the numerical geometry used by the algorithm, not the machine. It prevents a large-unit feature from dominating distance.'],
    ['What is the difference between a feature and a target?','Features are clues available to the model; the target is the answer a supervised model is trained to predict.'],
    ['Why can a deeper decision tree become worse on new data?','It can memorize small training-set quirks instead of learning rules that generalize.']
  ],
  8:[
    ['Why is a 99% training score not enough?','Because the model is useful only if the learned pattern works on unseen future data.'],
    ['What does leakage do to evaluation?','It lets information from the answer or future enter training/evaluation, creating unrealistically high scores.'],
    ['Why can many trees be more stable than one tree?','Different trees make different errors; averaging or voting reduces dependence on one unstable set of splits.']
  ],
  11:[
    ['What is the difference between a CNN and an LSTM input assumption?','A CNN exploits local spatial structure; an LSTM is built for ordered sequences where earlier steps can affect later ones.'],
    ['What does a neural-network weight actually do?','It multiplies a signal, controlling how strongly that signal influences the next calculation.'],
    ['Why is attention called contextual?','The relevance weights are recomputed for the current sequence, so a token can use different surrounding information in different sentences.']
  ],
  13:[
    ['Why does LoRA save training resources?','Most base-model weights remain frozen; only small low-rank adapter parameters are updated.'],
    ['What is the first thing to inspect when a RAG answer is wrong?','Inspect the retrieved chunks. If the evidence is wrong or missing, the generator never had a fair chance.'],
    ['Why is “more context” not automatically better?','Irrelevant context can distract the model, waste the context window, and reduce grounding quality.']
  ]
};

const EQ={
  2:{eq:'p(fail) = 1 / (1 + e^(−z)),   z = w·x + b',plain:'The model first makes a weighted score z from the measurements. The sigmoid turns that score into a value between 0 and 1. A threshold then converts the score into PASS or FAIL.',symbols:[['x','part measurements'],['w','learned importance of each measurement'],['b','learned offset'],['p(fail)','model score after the sigmoid']]},
  3:{eq:'KNN: d(x,xᵢ)=√Σ(xⱼ−xᵢⱼ)²    ·    SVM: maximize margin',plain:'KNN asks which labeled points are closest. SVM instead tries to place a separating boundary with as much breathing room as possible between classes.',symbols:[['d','distance between two readings'],['x','new machine reading'],['xᵢ','stored training reading'],['margin','distance between the SVM boundary and nearby classes']]},
  4:{eq:'Gini = 1 − Σ pₖ²',plain:'A tree tests candidate splits and prefers splits that make the child groups purer. Gini is one common impurity score: it becomes smaller when one class dominates a node.',symbols:[['pₖ','fraction of samples belonging to class k'],['Gini = 0','the node contains only one class']]},
  5:{eq:'Forest: ŷ = vote(T₁(x), …, Tₙ(x))',plain:'Each tree makes its own prediction from a slightly different view of the data. The forest combines those votes instead of trusting one tree.',symbols:[['Tᵢ','one decision tree'],['x','one machine reading'],['ŷ','combined prediction']]},
  6:{eq:'K-Means: minimize Σ ||xᵢ − μcluster(i)||²',plain:'K-Means moves centroids so points stay as close as possible to their assigned center. PCA solves a different problem: it finds directions that preserve large amounts of variation.',symbols:[['xᵢ','one telemetry reading'],['μ','centroid of its assigned cluster'],['|| · ||²','squared distance']]},
  7:{eq:'z = w·x + b,   a = f(z),   θ ← θ − η∇L',plain:'A neuron forms a weighted sum, adds a bias, and applies an activation. Training uses gradients to update the parameters in directions that reduce loss.',symbols:[['x','sensor inputs'],['w,b','learned parameters'],['f','activation function'],['η','learning rate'],['∇L','direction and size of loss change']]},
  8:{eq:'Ltotal = Ldata + λ Σ w²',plain:'L2 regularization adds a penalty for very large weights. The model must balance fitting the training data with keeping the solution less extreme.',symbols:[['Ldata','ordinary prediction loss'],['λ','regularization strength'],['Σw²','penalty for large weights']]},
  9:{eq:'y[i,j] = Σu,v K[u,v] · x[i+u,j+v]',plain:'A convolution takes one small image patch, multiplies it by a filter, adds the products, then slides the same filter to the next location.',symbols:[['K','small learned filter'],['x','input image'],['y','feature map produced by the filter']]},
  10:{eq:'cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ c̃ₜ',plain:'An LSTM combines remembered information with new candidate information. Learned gates decide how much old memory to keep and how much new information to add.',symbols:[['cₜ','current memory'],['fₜ','forget gate'],['iₜ','input gate'],['c̃ₜ','new candidate memory']]},
  11:{eq:'Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V',plain:'Queries are compared with keys to produce relevance scores. Softmax turns those scores into weights, which are used to mix the value vectors.',symbols:[['Q','what each token is looking for'],['K','what each token offers for matching'],['V','information to mix after matching'],['softmax','turns scores into normalized weights']]},
  12:{eq:'Wadapted = Wfrozen + (α/r)BA',plain:'The original weight matrix stays frozen. LoRA learns two much smaller matrices B and A whose product acts as a compact update.',symbols:[['Wfrozen','original pretrained weights'],['A,B','small trainable adapter matrices'],['r','LoRA rank'],['α','adapter scaling']]},
  13:{eq:'cos(q,d) = (q·d) / (||q|| ||d||)',plain:'Embedding retrieval often compares the question vector q with document vectors d. Higher cosine similarity means the vectors point in more similar directions in embedding space.',symbols:[['q','question embedding'],['d','document-chunk embedding'],['cos(q,d)','similarity score']]}
};

const LAB_CONTEXT={
  2:'Each dot in this lab should be read as one machined part. The horizontal position is the model’s failure score; moving the threshold changes which parts are rejected.',
  3:'Treat every point as one machine operating reading built from vibration, temperature, and load. KNN asks which known machine states are closest; SVM tries to separate those states with a boundary.',
  4:'The curves represent shipment-prediction performance as tree depth changes. Training performance can keep improving even after the tree becomes worse on unseen shipments.',
  5:'Each block represents one tree contributing to the predictive-maintenance decision. The leakage control intentionally demonstrates how a future repair clue can create a dishonest score.',
  6:'Each point is a multi-sensor machine reading. The colored groups are algorithmic clusters; they are not automatically real operating modes until an engineer interprets them.',
  7:'The network combines sensor clues such as torque, temperature, and vibration. The x1/x2 labels in the visual stand for normalized sensor dimensions, not abstract mystery values.',
  8:'Read the two bars as old-batch training performance versus unseen-batch validation performance. The goal is not to maximize the training bar; it is to build behavior that survives the new batch.',
  9:'The pixel grid represents a manufactured surface image. The filter is a small reusable pattern detector that could learn to react to an edge, scratch, pit, or texture.',
  10:'The points are ordered machine-energy readings. Changing memory length changes how much earlier process history the sequence model can use.',
  11:'The words should be read as a technician maintenance note. Attention changes which words influence each other when the note changes.',
  12:'The large block is the frozen pretrained model; the small trainable slice is the LoRA adapter. Rank changes adapter capacity without retraining the full model.',
  13:'The retrieved blocks are manual or service-record chunks. The system can only answer well if retrieval supplies the right evidence before generation begins.'
};

const ABILITIES={
  1:['Read a calibration scatter plot','Explain slope physically','Recognize an influential outlier'],
  2:['Separate model score from decision threshold','Explain precision vs recall','Choose a threshold from consequences'],
  3:['Explain why scaling changes distance','Describe KNN vs SVM','Spot unit-scale distortion'],
  4:['Read a tree as decisions','Recognize overfitting','Compare train and unseen performance'],
  5:['Explain ensemble voting','Detect leakage','Prioritize failure recall when appropriate'],
  6:['Distinguish clustering from labels','Question a forced k','Interpret PCA as a projection'],
  7:['Explain weights, bias, and activation','Connect gradient descent to training','Reason about model capacity'],
  8:['Separate training from generalization','Recognize distribution shift','Explain regularization as a tradeoff'],
  9:['Explain convolution and feature maps','Connect filters to local defects','Reason about pooling'],
  10:['Respect time order','Choose a history window deliberately','Recognize future leakage'],
  11:['Explain tokens and attention','Connect context to changing representations','Read a Transformer equation at a high level'],
  12:['Explain frozen base vs adapter','Reason about LoRA rank','Recognize quantization tradeoffs'],
  13:['Trace retrieve → context → answer','Inspect retrieval before blaming the LLM','Explain why more context can hurt']
};

function esc7(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function questId(){const t=document.querySelector('.v5-quest-title .v5-kicker')?.textContent||'';const m=t.match(/MODEL\s+0?(\d+)/i);return m?+m[1]:null}
function activeStep(){return document.querySelector('.v5-step.active b')?.textContent||''}
function saveSafe(){try{save()}catch(e){}}
function baseCamp(){if(typeof showHome==='function')showHome()}

function openPythonWorkshop(){
  const root=document.querySelector('#view'); if(!root)return;
  root.innerHTML=`<div class="v5-root"><main class="v7-workshop"><div class="v7-workshop-head"><div><div class="v5-kicker">BEFORE YOUR FIRST MODEL · 15–20 MIN</div><h1>Python Workshop</h1><p>You do not need to become a programmer first. Learn just enough Python to understand what the ML code is saying.</p></div><button class="v5-btn v5-main-menu-btn" id="v7PyReturn">← Base Camp</button></div><div class="v7-py-layout"><nav class="v7-py-nav">${PYTHON.map((x,i)=>`<button class="v7-py-tab ${i===0?'active':''}" data-py="${i}">${esc7(x.title.split(' — ')[0])}</button>`).join('')}</nav><section class="v7-py-panel" id="v7PyPanel"></section></div></main></div>`;
  const show=i=>{
    const x=PYTHON[i];
    document.querySelectorAll('[data-py]').forEach((b,n)=>b.classList.toggle('active',n===i));
    document.querySelector('#v7PyPanel').innerHTML=`<div class="v7-lesson"><div class="v5-kicker">PYTHON BASIC ${i+1} OF ${PYTHON.length}</div><h2>${esc7(x.title)}</h2><div class="v7-analogy"><b>Analogy</b><p>${esc7(x.analogy)}</p></div><h3>What is actually happening?</h3><p>${esc7(x.body)}</p><pre class="v7-code">${esc7(x.code)}</pre><div class="v7-mini-challenge"><b>Check yourself</b><p>${esc7(x.challenge)}</p><button class="v5-btn" id="v7PyReveal">Reveal answer</button><div class="v7-answer" id="v7PyAnswer" hidden>${esc7(x.answer)}</div></div>${i<PYTHON.length-1?'<button class="v5-btn primary" id="v7PyNext">Next Python basic →</button>':'<button class="v5-btn primary" id="v7PyDone">✓ I understand the essentials — start Model 1</button>'}</div>`;
    document.querySelector('#v7PyReveal').onclick=()=>document.querySelector('#v7PyAnswer').hidden=false;
    document.querySelector('#v7PyNext')?.addEventListener('click',()=>show(i+1));
    document.querySelector('#v7PyDone')?.addEventListener('click',()=>{try{st.pythonWorkshopDone=true}catch(e){};saveSafe();if(typeof go==='function')go(1)});
  };
  document.querySelectorAll('[data-py]').forEach(b=>b.onclick=()=>show(+b.dataset.py));
  document.querySelector('#v7PyReturn').onclick=baseCamp;
  show(0);
  scrollTo({top:0,behavior:'smooth'});
}

function addPythonEntry(){
  const grid=[...document.querySelectorAll('.v5-home-sections .v5-resource-grid')][0];
  if(grid&&!grid.querySelector('[data-v7-python]')){
    const b=document.createElement('button');
    b.className='v5-resource v7-python-entry';
    b.dataset.v7Python='1';
    b.innerHTML=`<small>START HERE IF PYTHON IS NEW</small><h3>Python Workshop</h3><p>Variables, lists, if/else, loops, functions and imports — only the pieces needed before Model 1.${typeof st!=='undefined'&&st.pythonWorkshopDone?' <b>✓ Completed</b>':''}</p>`;
    b.onclick=openPythonWorkshop;
    grid.prepend(b);
  }
  const actions=document.querySelector('.v5-map-actions');
  if(actions&&!actions.querySelector('[data-v7-python]')){
    const b=document.createElement('button');
    b.className='v5-btn v5-main-menu-btn';
    b.dataset.v7Python='1';
    b.textContent='Python Workshop';
    b.onclick=openPythonWorkshop;
    actions.appendChild(b);
  }
}

function addRegionGuide(){
  const head=document.querySelector('.v5-map-head');
  if(!head||document.querySelector('.v7-region-guide'))return;
  const d=document.createElement('details');
  d.className='v7-region-guide';
  d.innerHTML=`<summary>What do the world regions mean?</summary><div class="v7-region-grid">${Object.entries(REGIONS).map(([n,t])=>`<div><b>${esc7(n)}</b><p>${esc7(t)}</p></div>`).join('')}</div>`;
  head.insertAdjacentElement('afterend',d);
  document.querySelectorAll('.v5-region-label').forEach(el=>{const t=REGIONS[el.textContent.trim()];if(t)el.title=t});
}

function bossReady(wrap){
  const attempt=wrap?.querySelector('#v7BossAttempt');
  const answer=wrap?.querySelector('#v7BossAnswer');
  return !!attempt?.value.trim() && answer && !answer.hidden;
}
function showBossNudge(wrap){
  if(!wrap)return;
  const attempt=wrap.querySelector('#v7BossAttempt');
  const note=wrap.querySelector('#v7BossGate');
  if(!attempt?.value.trim()){
    attempt.placeholder='Write at least one prediction first — even if you are unsure.';
    attempt.focus();
    if(note)note.textContent='Write your prediction first.';
    return;
  }
  if(note)note.textContent='Reveal the explanation, compare it with your reasoning, then complete the quest.';
  wrap.querySelector('#v7BossReveal')?.focus();
}
function gateChallenge(wrap){
  const buttons=[document.querySelector('#v5MarkComplete'),document.querySelector('#v5Next')].filter(Boolean);
  buttons.forEach(btn=>{
    if(btn.dataset.v7Gated==='1')return;
    btn.dataset.v7Gated='1';
    const original=btn.onclick;
    btn.onclick=function(e){
      if(!bossReady(wrap)){e?.preventDefault?.();showBossNudge(wrap);return false}
      return typeof original==='function'?original.call(this,e):undefined;
    };
  });
}
function addBossFeedback(){
  const box=document.querySelector('.v5-challenge');
  const id=questId();
  if(!box||!id||box.querySelector('.v7-boss-feedback'))return;
  const x=BOSS[id]; if(!x)return;
  const wrap=document.createElement('div');
  wrap.className='v7-boss-feedback';
  wrap.innerHTML=`<div class="v5-kicker">CLOSE THE LOOP</div><h3>Write your reasoning before you reveal the explanation.</h3><p class="v7-muted">A wrong prediction is useful if you can explain what the experiment taught you.</p><textarea id="v7BossAttempt" placeholder="I predict that... because..."></textarea><button class="v5-btn" id="v7BossReveal">Reveal what should happen + why</button><div class="v7-gate-note" id="v7BossGate">Prediction + explanation review required before completion.</div><div class="v7-boss-answer" id="v7BossAnswer" hidden><div><b>What should happen</b><p>${esc7(x.what)}</p></div><div><b>Why</b><p>${esc7(x.why)}</p></div><div class="v7-ability-unlock"><b>Abilities you should now have</b><ul>${(ABILITIES[id]||[]).map(a=>`<li>✓ ${esc7(a)}</li>`).join('')}</ul></div></div>`;
  const mark=box.querySelector('#v5MarkComplete');
  if(mark)mark.before(wrap);else box.appendChild(wrap);
  wrap.querySelector('#v7BossReveal').onclick=()=>{
    const ta=wrap.querySelector('#v7BossAttempt');
    if(!ta.value.trim()){showBossNudge(wrap);return}
    wrap.querySelector('#v7BossAnswer').hidden=false;
    wrap.querySelector('#v7BossGate').textContent='Compare the explanation with your prediction. If the result surprised you, explain the difference before moving on.';
  };
  gateChallenge(wrap);
}

function addRecall(){
  const id=questId(),qs=CHECKPOINTS[id],box=document.querySelector('.v5-challenge');
  if(!qs||!box||box.querySelector('.v7-recall'))return;
  const r=document.createElement('section');
  r.className='v7-recall';
  r.innerHTML=`<div class="v5-kicker">REGION CHECKPOINT · RETRIEVE FROM MEMORY</div><h3>Can you reconnect the earlier ideas without rereading them first?</h3><p>Say the answer out loud or type a note somewhere. Then reveal the explanation and compare.</p>${qs.map((q,i)=>`<div class="v7-recall-q"><b>${i+1}. ${esc7(q[0])}</b><button class="v5-btn" data-recall="${i}">Reveal</button><p data-recall-answer="${i}" hidden>${esc7(q[1])}</p></div>`).join('')}`;
  const feedback=box.querySelector('.v7-boss-feedback');
  if(feedback)feedback.before(r);else box.appendChild(r);
  r.querySelectorAll('[data-recall]').forEach(b=>b.onclick=()=>r.querySelector(`[data-recall-answer="${b.dataset.recall}"]`).hidden=false);
}

function addEquation(){
  const id=questId(),eq=EQ[id];
  if(!eq||!activeStep().includes('Math'))return;
  const host=document.querySelector('#v5Screen');
  if(!host||host.querySelector('.v7-equation-card'))return;
  const c=document.createElement('div');
  c.className='v5-card v7-equation-card';
  c.innerHTML=`<div class="v5-kicker">SHOW ME THE ACTUAL EQUATION</div><h2>One equation worth understanding</h2><div class="v7-equation">${esc7(eq.eq)}</div><p>${esc7(eq.plain)}</p><div class="v7-symbols">${(eq.symbols||[]).map(([s,t])=>`<div><code>${esc7(s)}</code><span>${esc7(t)}</span></div>`).join('')}</div><p class="v7-math-note">Do not memorize the symbols first. Point to what each symbol represents in the visual model, then return to the equation.</p>`;
  host.appendChild(c);
}

function addLabContext(){
  const id=questId();
  if(!id||!activeStep().includes('Lab'))return;
  const side=document.querySelector('.v5-lab-side');
  if(!side||side.querySelector('.v7-lab-context')||!LAB_CONTEXT[id])return;
  const card=document.createElement('div');
  card.className='v5-side-card v7-lab-context';
  card.innerHTML=`<small>ENGINEERING TRANSLATION</small><h3>What this visual represents here</h3><p>${esc7(LAB_CONTEXT[id])}</p>`;
  side.prepend(card);
}

function mechanicalizeVisibleLab(){
  const id=questId();
  if(id===2){
    const svg=document.querySelector('#logSvg');
    if(svg){
      [...svg.querySelectorAll('text')].forEach(t=>{
        const s=t.textContent||'';
        if(s.includes('each dot = one person'))t.textContent='each dot = one machined part • horizontal position = model failure score';
        if(s.includes('model thinks NO'))t.textContent='0.0 — model leans PASS';
        if(s.includes('model thinks YES'))t.textContent='model leans FAIL — 1.0';
      });
    }
  }
  if(id===11){
    const viz=document.querySelector('#genericViz');
    if(viz){
      const words=['Bearing','vibration','rose','after','the','motor','ran','hot'];
      [...viz.querySelectorAll('button')].forEach((b,i)=>{if(i<words.length&&b.textContent!==words[i])b.textContent=words[i]});
    }
  }
}

function enhance(){
  if(V7.enhancing)return;
  V7.enhancing=true;
  try{
    addPythonEntry();
    addRegionGuide();
    addBossFeedback();
    addRecall();
    addEquation();
    addLabContext();
    mechanicalizeVisibleLab();
  }finally{V7.enhancing=false}
}

const mo=new MutationObserver(()=>queueMicrotask(enhance));
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{
    enhance();
    mo.observe(document.body,{childList:true,subtree:true,characterData:true});
  });
}else{
  enhance();
  mo.observe(document.body,{childList:true,subtree:true,characterData:true});
}

window.ModelQuestV7={openPythonWorkshop,enhance};
})();