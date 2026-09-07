/* ModelQuest clarity pass — teach the ideas before using the vocabulary. */
(()=>{
  const explanation={
    problem:'The sensor gives voltage, but the exact voltage-to-force conversion is not built into our program. If we already had a trustworthy physics equation or manufacturer calibration equation, we would use it. Here we have examples instead, so we let the data teach us the relationship.',
    examples:'These are calibration examples where both values are already known. For example, 0.42 V happened when 10 N was applied. We collect several pairs because real measurements can have noise and small variation.',
    pattern:'The force rises by about 10 N whenever voltage rises by about 0.4 V. That is a nearly constant rate of change. On a graph, a constant rate of change makes points sit close to a straight line.',
    line:'A straight line is our first model because it is the simplest shape that matches the pattern we see. We are not claiming every relationship is linear. We try the line, measure its errors, and only keep it if it describes the data well enough.',
    slope:'Slope is simply a rate of change. Ask: when voltage changes, how much does force change? Between 0.42 V = 10 N and 0.81 V = 20 N, voltage changed by 0.39 V and force changed by 10 N. So that local rate is 10 ÷ 0.39 ≈ 25.6 N per volt.',
    parameters:'A straight line can be stored with two numbers. Slope is the rate of change. Intercept is an offset that moves the whole line up or down. With noisy data, the pair-to-pair rates are not identical, so linear regression chooses one slope and one intercept that make the whole line fit all the examples as well as possible.',
    curve:'A curve is allowed. If the calibration points bend, or the straight line makes a systematic pattern of errors, a curved model may be better. The goal is not to force a line onto the data; it is to choose a useful relationship that works on new readings.',
    gradient:'The computer does not magically know the best slope. One way to learn it is to start with a guess, calculate the prediction errors, ask which direction would reduce those errors, move the slope and intercept a little, and repeat. That repeated correction process is gradient descent.',
    newreading:'After the relationship has been learned, we can give the model a voltage whose force is unknown, such as 1.05 V. The learned equation estimates the force without repeating the calibration experiment.',
    force:'With these sample calibration points, the learned line estimates about 26 N for 1.05 V. The useful part is not the line itself — it is that the learned relationship can now convert future sensor readings into physical values.'
  };

  function model1(){
    return /MODEL\s+01\b/i.test(document.querySelector('.v5-quest-title .v5-kicker')?.textContent||'');
  }

  function activeStep(){
    return document.querySelector('.v5-step.active b')?.textContent||'';
  }

  function openGradientDescent(){
    if(typeof window.MQ_OPEN_EXPLANATION==='function'){
      window.MQ_OPEN_EXPLANATION('gradient descent');
    }
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
      note.innerHTML='<b>Important rule for this chapter:</b> a new term should never appear before its meaning. We will first see the idea, then give it the ML/math name.';
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
            <h3>Because the rule is not already known.</h3>
            <p>If we had an exact equation, we would use it. Here we have examples from the real sensor, so we use those examples to learn the rule.</p>
          </article>
          <article class="v8-why-card">
            <small>2 · WHY A LINE?</small>
            <h3>Because the change looks almost constant.</h3>
            <p>About every 0.4 V increase corresponds to about 10 N more force. Constant change is the pattern represented by a straight line.</p>
          </article>
          <article class="v8-why-card">
            <small>3 · WHAT IS SLOPE?</small>
            <h3>It is just “how much output changes per unit of input.”</h3>
            <p>Here: how many newtons change for each volt. The unit is therefore <b>N/V</b>.</p>
          </article>
        </div>

        <div class="v8-calibration-pairs" aria-label="Example calibration pairs">
          <span class="v8-pair">0.42 V ↔ 10 N</span>
          <span class="v8-pair">0.81 V ↔ 20 N</span>
          <span class="v8-pair">1.22 V ↔ 30 N</span>
          <span class="v8-pair">1.60 V ↔ 40 N</span>
          <span class="v8-pair">1.98 V ↔ 50 N</span>
        </div>

        <div class="v8-slope-lesson">
          <div class="v8-slope-title">
            <small>BEFORE USING THE WORD “SLOPE”</small>
            <h3>Compare two measurements and ask: how fast did force change compared with voltage?</h3>
          </div>
          <div class="v8-slope-worked">
            <div><small>VOLTAGE CHANGE</small><b>0.81 − 0.42 = 0.39 V</b></div>
            <div class="v8-math-arrow">→</div>
            <div><small>FORCE CHANGE</small><b>20 − 10 = 10 N</b></div>
            <div class="v8-math-arrow">→</div>
            <div class="v8-slope-answer"><small>RATE OF CHANGE</small><b>10 N ÷ 0.39 V ≈ 25.6 N/V</b></div>
          </div>
          <p><b>That rate of change is what “slope” means.</b> It is not a mysterious ML value. If the line has slope 25.6 N/V, moving 1 volt to the right on the graph moves about 25.6 newtons upward.</p>
          <p class="v8-small-note"><b>Is slope just an average of all the N ÷ V values?</b> No. With noisy measurements, each pair can give a slightly different rate. Linear regression chooses one overall slope and intercept that make the single straight line fit all points as well as possible.</p>
        </div>

        <div class="v8-pattern-callout">
          <div><small>BETWEEN POINTS 1 → 2</small><b>+0.39 V → +10 N</b></div>
          <div><small>BETWEEN POINTS 2 → 3</small><b>+0.41 V → +10 N</b></div>
          <div><small>BETWEEN POINTS 3 → 4</small><b>+0.38 V → +10 N</b></div>
          <p>The increments are not perfectly identical, but they are close. That is why one constant rate — one straight-line slope — is a sensible first attempt.</p>
        </div>

        <div class="v8-gradient-card">
          <div>
            <small>THEN HOW DOES THE COMPUTER FIND THE SLOPE?</small>
            <h3>It can improve a guess a little at a time.</h3>
            <p>Start with a bad slope and intercept. Predict the known forces. Measure the errors. Work out whether changing the slope/intercept up or down would reduce the error. Move a little. Repeat. <b>That repeated correction process is called Gradient Descent.</b></p>
          </div>
          <div class="v8-gradient-steps">
            <span><b>1</b> Guess a line</span>
            <span><b>2</b> Measure error</span>
            <span><b>3</b> Move in a better direction</span>
            <span><b>4</b> Repeat</span>
          </div>
          <button type="button" class="v8-gradient-button" data-v8-gradient>Explain Gradient Descent visually →</button>
        </div>

        <div class="v8-flow" aria-label="Linear regression reasoning flow">
          <button class="v8-flow-step active" data-v8-part="problem"><small>1 · PROBLEM</small><b>We need a conversion rule</b><span>Future readings give voltage, not force.</span></button>
          <button class="v8-flow-step" data-v8-part="examples"><small>2 · EXAMPLES</small><b>Collect known pairs</b><span>Measure voltage while applying known forces.</span></button>
          <button class="v8-flow-step" data-v8-part="pattern"><small>3 · PATTERN</small><b>Check how the values change</b><span>The rate looks nearly constant.</span></button>
          <button class="v8-flow-step" data-v8-part="line"><small>4 · MODEL CHOICE</small><b>Try a straight line</b><span>A nearly constant rate suggests a line.</span></button>
          <button class="v8-flow-step" data-v8-part="slope"><small>5 · SLOPE</small><b>Turn steepness into a number</b><span>Change in force ÷ change in voltage.</span></button>
          <button class="v8-flow-step" data-v8-part="gradient"><small>6 · LEARNING</small><b>Improve slope + intercept</b><span>Gradient descent can adjust the guesses.</span></button>
          <button class="v8-flow-step" data-v8-part="newreading"><small>7 · USE IT</small><b>Give it a new voltage</b><span>The learned rule estimates force.</span></button>
        </div>
        <div class="v8-explain" id="v8FlowExplain"><b>Step 1 · Why a model?</b><br>${explanation.problem}</div>
      </section>

      <aside class="v8-model-side">
        <div class="v8-side-card">
          <small>LINEAR REGRESSION</small>
          <h3>Why does this method exist?</h3>
          <p>It gives us a systematic way to learn one useful straight-line relationship from noisy examples instead of choosing a line by eye.</p>
        </div>
        <div class="v8-side-card v8-side-highlight">
          <small>SLOPE — FROM ZERO</small>
          <h3>“Per” is the key word.</h3>
          <p>Speed can be miles <b>per</b> hour. This sensor relationship can be newtons <b>per</b> volt. Slope is the same idea: output change <b>per</b> input change.</p>
          <div class="v8-equation">slope = Δforce ÷ Δvoltage</div>
          <p class="v8-delta-note"><b>Δ (delta)</b> just means “change in.”</p>
        </div>
        <div class="v8-side-card">
          <small>WORKED EXAMPLE</small>
          <h3>Where does 25.6 N/V come from?</h3>
          <div class="v8-equation">Δforce = 20 − 10 = 10 N</div>
          <div class="v8-equation">Δvoltage = 0.81 − 0.42 = 0.39 V</div>
          <div class="v8-equation">10 ÷ 0.39 ≈ 25.6 N/V</div>
        </div>
        <div class="v8-side-card">
          <small>INTERCEPT</small>
          <h3>What is the other number?</h3>
          <p>The <b>intercept</b> is an offset. It moves the whole line up or down. In the equation <b>Force = slope × Voltage + intercept</b>, the slope controls steepness and the intercept controls the starting offset.</p>
        </div>
        <div class="v8-side-card">
          <small>WHY NOT A CURVE?</small>
          <h3>A curve may be better sometimes.</h3>
          <p>We start with a line because the data looks close to a constant-rate relationship. If the points bend or the line misses them systematically, a curve is a better model.</p>
        </div>
      </aside>
    </div>`;
  }

  function fixModelScreen(){
    if(!model1()||!/^3\./.test(activeStep().trim()))return;
    const screen=document.querySelector('#v5Screen');
    if(!screen)return;
    if(screen.dataset.v11Basics==='1')return;
    screen.dataset.v11Basics='1';
    screen.innerHTML=modelScreenHTML();
  }

  function enhance(){
    fixQuestion();
    fixModelScreen();
    document.querySelectorAll('button,[data-concept]').forEach(el=>{
      const text=(el.textContent||'').trim();
      if(/gradient\s*descent/i.test(text)||el.dataset.concept==='gradient-descent'||el.dataset.concept==='gradient descent'){
        el.classList.add('v8-gd-easy');
        el.title='Click once for the Gradient Descent explanation';
      }
    });
  }

  document.addEventListener('click',e=>{
    const gd=e.target.closest('[data-v8-gradient],.v8-gd-easy');
    if(gd){
      e.preventDefault();
      e.stopPropagation();
      openGradientDescent();
      return;
    }

    const b=e.target.closest('[data-v8-part]');
    if(!b)return;
    document.querySelectorAll('[data-v8-part]').forEach(x=>x.classList.toggle('active',x===b));
    const key=b.dataset.v8Part;
    const labels={problem:'Step 1 · Why a model?',examples:'Step 2 · Calibration examples',pattern:'Step 3 · Notice the pattern',line:'Step 4 · Why try a line?',slope:'Step 5 · What slope means',parameters:'What slope and intercept mean',gradient:'Step 6 · How the model learns',curve:'Why not a curve?',newreading:'Step 7 · Use the learned rule',force:'Prediction'};
    const out=document.querySelector('#v8FlowExplain');
    if(out)out.innerHTML=`<b>${labels[key]||'Step'}</b><br>${explanation[key]||''}`;
  },true);

  const root=document.querySelector('#view');
  if(root){
    const obs=new MutationObserver(()=>requestAnimationFrame(enhance));
    obs.observe(root,{childList:true,subtree:true});
  }
  requestAnimationFrame(enhance);
})();
