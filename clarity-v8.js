/* ModelQuest clarity pass — teaches why ML exists before teaching Linear Regression. */
(()=>{
  const explanation={
    problem:'The sensor gives voltage, but the exact voltage-to-force conversion is not built into our program. If we already had a trustworthy physics equation or manufacturer calibration equation, we would use it. Here we have examples instead, so we let the data teach us the relationship.',
    examples:'These are calibration examples where both values are already known. For example, 0.42 V happened when 10 N was applied. We collect several pairs because real measurements can have noise and small variation.',
    pattern:'The force increases by about 10 N whenever voltage rises by about 0.4 V. That is a nearly constant rate of change. On a graph, a constant rate of change looks approximately like a straight line.',
    line:'A straight line is our first model because it is the simplest shape that matches the pattern we see. We are not claiming every relationship is linear. We try the line, measure its errors, and only keep it if it describes the data well enough.',
    parameters:'The line can be stored with two numbers. Slope tells us the rate of change — roughly how many newtons correspond to one extra volt. Intercept handles the offset. Together they turn the visual line into a reusable equation.',
    curve:'A curve is allowed. If the calibration points bend, or the line makes systematic errors, a curved model may be better. The point of modelling is not to force a line onto the data; it is to choose a useful relationship that works on new readings.',
    newreading:'After the relationship has been learned, we can give the model a voltage whose force is unknown, such as 1.05 V. The learned equation estimates the force without repeating the calibration experiment.',
    force:'With these sample calibration points, the learned line estimates about 26 N for 1.05 V. The useful part is not the line itself — it is that the learned relationship can now convert future sensor readings into physical values.'
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
    if(!q)return;
    q.dataset.v8Clear='1';
    q.textContent='We can measure voltage and force together during a test. Can we use those examples to learn a rule that estimates force later, when only voltage is known?';
    const eli=document.querySelector('.v5-eli5');
    if(eli){
      eli.dataset.v8Clear='1';
      eli.innerHTML='<b>First: why use machine learning at all?</b><br>If an exact, trustworthy conversion equation already existed, we would simply use that equation. But often we have measurements instead: known forces and the voltages the real sensor produced. Machine learning means using those examples to learn the relationship instead of hand-writing the relationship ourselves.';
      let note=eli.nextElementSibling;
      if(!note?.classList.contains('v8-question-note')){
        eli.insertAdjacentHTML('afterend','<div class="v8-question-note"></div>');
        note=eli.nextElementSibling;
      }
      note.innerHTML='<b>What this chapter is really teaching:</b> why data can become a prediction rule, why a straight line is a reasonable first model here, what slope physically means, and when a curve would be a better choice.';
    }
  }

  function modelScreenHTML(){
    return `<div class="v8-model-story">
      <section class="v8-model-main">
        <div class="v5-kicker">FROM DATA → RELATIONSHIP → PREDICTION</div>
        <h2>Why do we need a model at all?</h2>
        <p>During calibration we know both values: the force we applied and the voltage the sensor produced. Later, the machine will only give us voltage. We need a reusable rule that turns that voltage into an estimated force.</p>

        <div class="v8-why-grid">
          <article class="v8-why-card">
            <small>1 · WHY ML?</small>
            <h3>Because the relationship is not already written down for us.</h3>
            <p>If we already knew an exact equation, we would use it. Here we have examples from the real sensor, so we ask the data to teach us the mapping.</p>
          </article>
          <article class="v8-why-card">
            <small>2 · WHY A LINE?</small>
            <h3>Because the change is almost constant.</h3>
            <p>About every 0.4 V increase corresponds to about 10 N more force. A nearly constant rate of change is exactly the pattern a straight line represents.</p>
          </article>
          <article class="v8-why-card">
            <small>3 · WHY SLOPE?</small>
            <h3>Slope is the rate hidden inside the line.</h3>
            <p>A slope near 25 N/V means that one extra volt corresponds to roughly 25 extra newtons. It turns “the line goes upward” into a useful physical number.</p>
          </article>
        </div>

        <div class="v8-calibration-pairs" aria-label="Example calibration pairs">
          <span class="v8-pair">0.42 V ↔ 10 N</span>
          <span class="v8-pair">0.81 V ↔ 20 N</span>
          <span class="v8-pair">1.22 V ↔ 30 N</span>
          <span class="v8-pair">1.60 V ↔ 40 N</span>
          <span class="v8-pair">1.98 V ↔ 50 N</span>
        </div>

        <div class="v8-pattern-callout">
          <div><small>LOOK AT THE PATTERN</small><b>+0.39 V → +10 N</b></div>
          <div><small>AGAIN</small><b>+0.41 V → +10 N</b></div>
          <div><small>AGAIN</small><b>+0.38 V → +10 N</b></div>
          <p>The increments are not perfectly identical, but they are close. That is why a straight-line model is a sensible first attempt.</p>
        </div>

        <div class="v8-flow" aria-label="Linear regression reasoning flow">
          <button class="v8-flow-step active" data-v8-part="problem"><small>1 · PROBLEM</small><b>We need a conversion rule</b><span>Future readings give voltage, not force.</span></button>
          <button class="v8-flow-step" data-v8-part="examples"><small>2 · EXAMPLES</small><b>Collect known pairs</b><span>Measure voltage while applying known forces.</span></button>
          <button class="v8-flow-step" data-v8-part="pattern"><small>3 · PATTERN</small><b>Check how the values change</b><span>The rate looks nearly constant.</span></button>
          <button class="v8-flow-step" data-v8-part="line"><small>4 · MODEL CHOICE</small><b>Try the simplest matching shape</b><span>A constant rate suggests a line.</span></button>
          <button class="v8-flow-step" data-v8-part="parameters"><small>5 · LEARN</small><b>Find slope + intercept</b><span>Fit the line that best matches all examples.</span></button>
          <button class="v8-flow-step" data-v8-part="newreading"><small>6 · USE IT</small><b>Give it a new voltage</b><span>The learned rule estimates force.</span></button>
        </div>
        <div class="v8-explain" id="v8FlowExplain"><b>Step 1 · Why a model?</b><br>${explanation.problem}</div>
      </section>

      <aside class="v8-model-side">
        <div class="v8-side-card">
          <small>LINEAR REGRESSION</small>
          <h3>Why does this method exist?</h3>
          <p>It gives us a systematic way to learn the best straight-line relationship from noisy examples instead of choosing a line by eye.</p>
        </div>
        <div class="v8-side-card">
          <small>THE LINE</small>
          <h3>What does slope actually mean?</h3>
          <p><b>Slope</b> is change in predicted force divided by change in voltage. Here it is about <b>25 N/V</b>, so an extra volt corresponds to roughly 25 additional newtons.</p>
          <div class="v8-equation">slope = change in force ÷ change in voltage</div>
          <div class="v8-equation">Force ≈ 25.57 × Voltage − 0.84</div>
        </div>
        <div class="v8-side-card">
          <small>WHY NOT A CURVE?</small>
          <h3>A curve may be better sometimes.</h3>
          <p>We start with a line because it is simple and the data looks close to linear. If the points bend or the line misses them in a systematic pattern, we should use a more flexible model instead.</p>
        </div>
        <div class="v8-side-card">
          <small>CORE ML IDEA</small>
          <h3>Do not use complexity unless the data needs it.</h3>
          <p>Start with the simplest model that could explain the pattern. Test it on data. Make the model more flexible only when the simpler relationship is not good enough.</p>
        </div>
      </aside>
    </div>`;
  }

  function fixModelScreen(){
    if(!model1()||!/^3\./.test(activeStep().trim()))return;
    const screen=document.querySelector('#v5Screen');
    if(!screen)return;
    if(screen.dataset.v10Reasoning==='1')return;
    screen.dataset.v10Reasoning='1';
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
    const labels={problem:'Step 1 · Why a model?',examples:'Step 2 · Calibration examples',pattern:'Step 3 · Notice the pattern',line:'Step 4 · Why try a line?',parameters:'Step 5 · What slope and intercept mean',curve:'Why not a curve?',newreading:'Step 6 · Use the learned rule',force:'Prediction'};
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
