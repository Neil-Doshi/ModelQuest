/* ModelQuest v8 clarity pass — fixes Model 1 wording and removes stale practice-hours model diagram. */
(()=>{
  const explanation={
    examples:'These are calibration examples where both values are already known. For example, 0.42 V happened when 10 N was applied. The model uses several pairs like this to see the relationship.',
    line:'Linear regression looks for the straight line that stays as close as possible to all of the calibration points. It is not choosing a line by eye.',
    parameters:'The learned line is stored as two numbers: slope and intercept. The slope tells us how many newtons change for each volt. The intercept is the small offset in the conversion rule.',
    newreading:'After calibration, the model is no longer learning. We give it a new voltage reading from the sensor, such as 1.05 V.',
    force:'The fixed line converts that new voltage into an estimated force. With these sample calibration points, 1.05 V is about 26.0 N.'
  };

  function model1(){
    return /MODEL\s+01\b/i.test(document.querySelector('.v5-quest-title .v5-kicker')?.textContent||'');
  }

  function activeStep(){
    return document.querySelector('.v5-step.active b')?.textContent||'';
  }

  function fixQuestion(){
    if(!model1())return;
    const q=document.querySelector('.v5-question');
    if(!q||q.dataset.v8Clear==='1')return;
    q.dataset.v8Clear='1';
    q.textContent='The sensor shows voltage, but we want force. How can we use the voltage reading to estimate force in newtons?';
    const eli=document.querySelector('.v5-eli5');
    if(eli){
      eli.dataset.v8Clear='1';
      eli.innerHTML='<b>Start with a simple calibration test</b><br>Press the sensor with forces we already know — for example 10 N, 20 N, 30 N — and record the voltage each time. Those known pairs show how voltage changes with force. Linear regression learns one straight-line conversion rule from them. Later, when the sensor gives a new voltage, that rule estimates the force.';
      if(!eli.nextElementSibling?.classList.contains('v8-question-note')){
        eli.insertAdjacentHTML('afterend','<div class="v8-question-note"><b>The goal on this lesson:</b> learn how examples such as <b>0.42 V = 10 N</b> become a reusable conversion rule for new sensor readings.</div>');
      }
    }
  }

  function modelScreenHTML(){
    return `<div class="v8-model-story">
      <section class="v8-model-main">
        <div class="v5-kicker">WHAT LINEAR REGRESSION IS DOING HERE</div>
        <h2>Learn a voltage → force conversion rule</h2>
        <p>During calibration, we already know the force we applied and we measure the voltage the sensor produces. Linear regression uses those pairs to learn the straight-line relationship between the two.</p>
        <div class="v8-calibration-pairs" aria-label="Example calibration pairs">
          <span class="v8-pair">0.42 V ↔ 10 N</span>
          <span class="v8-pair">0.81 V ↔ 20 N</span>
          <span class="v8-pair">1.22 V ↔ 30 N</span>
          <span class="v8-pair">1.60 V ↔ 40 N</span>
          <span class="v8-pair">1.98 V ↔ 50 N</span>
        </div>
        <div class="v8-flow" aria-label="Linear regression calibration flow">
          <button class="v8-flow-step active" data-v8-part="examples"><small>1 · CALIBRATION DATA</small><b>Known voltage + known force</b><span>Give the model examples where the answer is already known.</span></button>
          <button class="v8-flow-step" data-v8-part="line"><small>2 · FIT</small><b>Find the best straight line</b><span>Choose the line that best follows all calibration points.</span></button>
          <button class="v8-flow-step" data-v8-part="parameters"><small>3 · LEARN</small><b>Save slope + intercept</b><span>These two numbers become the conversion rule.</span></button>
          <button class="v8-flow-step" data-v8-part="newreading"><small>4 · NEW READING</small><b>Sensor gives 1.05 V</b><span>No known force is provided now.</span></button>
          <button class="v8-flow-step" data-v8-part="force"><small>5 · PREDICT</small><b>Estimate the force</b><span>The learned rule gives about 26.0 N.</span></button>
        </div>
        <div class="v8-explain" id="v8FlowExplain"><b>Step 1 · Calibration data</b><br>${explanation.examples}</div>
      </section>
      <aside class="v8-model-side">
        <div class="v8-side-card">
          <small>MODEL IDEA</small>
          <h3>What is linear regression?</h3>
          <p>It finds the straight-line relationship that best matches the examples. For this sensor, that line becomes the rule for converting voltage into force.</p>
        </div>
        <div class="v8-side-card">
          <small>TRAINING</small>
          <h3>What does it learn?</h3>
          <p><b>Slope:</b> how much the predicted force changes for each extra volt.<br><br><b>Intercept:</b> the small offset in the line.</p>
          <div class="v8-equation">Force ≈ 25.57 × Voltage − 0.84</div>
        </div>
        <div class="v8-side-card">
          <small>PREDICTION</small>
          <h3>What happens after training?</h3>
          <p>The slope and intercept stay fixed. A new voltage goes into the equation and an estimated force comes out. The model does not retrain for every reading.</p>
          <div class="v8-equation">1.05 V → about 26.0 N</div>
        </div>
      </aside>
    </div>`;
  }

  function fixModelScreen(){
    if(!model1()||!/^3\./.test(activeStep().trim()))return;
    const screen=document.querySelector('#v5Screen');
    if(!screen||screen.querySelector('.v8-model-story'))return;
    screen.innerHTML=modelScreenHTML();
  }

  function enhance(){
    fixQuestion();
    fixModelScreen();
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-v8-part]');
    if(!b)return;
    document.querySelectorAll('[data-v8-part]').forEach(x=>x.classList.toggle('active',x===b));
    const key=b.dataset.v8Part;
    const labels={examples:'Step 1 · Calibration data',line:'Step 2 · Fit the line',parameters:'Step 3 · Learned parameters',newreading:'Step 4 · New sensor reading',force:'Step 5 · Force estimate'};
    const out=document.querySelector('#v8FlowExplain');
    if(out)out.innerHTML=`<b>${labels[key]||'Step'}</b><br>${explanation[key]||''}`;
  });

  const root=document.querySelector('#view');
  if(root){
    const obs=new MutationObserver(()=>requestAnimationFrame(enhance));
    obs.observe(root,{childList:true,subtree:true});
  }
  requestAnimationFrame(enhance);
})();
