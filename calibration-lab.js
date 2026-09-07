/* Canonical Model 1 calibration + Gradient Descent lab. */
(()=>{
  const DATA=[[.42,10],[.81,20],[1.22,30],[1.60,40],[1.98,50]];
  const OPT={m:25.57026263,b:-.83773674};
  let state=null,timer=null;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mse(m,b){return DATA.reduce((s,[x,y])=>s+(m*x+b-y)**2,0)/DATA.length}
  function grad(m,b){let dm=0,db=0;for(const [x,y] of DATA){const e=m*x+b-y;dm+=2*x*e/DATA.length;db+=2*e/DATA.length}return [dm,db]}
  function html(){return `<div class="mqcal" id="mqCalLab">
    <div class="mqcal-grid">
      <section class="mqcal-panel"><h3>1 · Current guess vs real measurements</h3><p>The vertical residual lines show how wrong the current straight line is at each known calibration point.</p><svg class="mqcal-svg" data-graph viewBox="0 0 720 430"></svg></section>
      <aside class="mqcal-panel"><h3>Change the line</h3><div class="mqcal-controls">
        <div class="mqcal-control"><label><span>Slope</span><b data-mout></b></label><input data-m type="range" min="5" max="45" step="0.1" value="12"></div>
        <div class="mqcal-control"><label><span>Intercept</span><b data-bout></b></label><input data-b type="range" min="-15" max="15" step="0.1" value="2"></div>
        <div class="mqcal-control"><label><span>Learning rate</span><b data-lrout></b></label><input data-lr type="range" min="0.001" max="0.25" step="0.001" value="0.02"></div>
        <div class="mqcal-actions"><button class="v5-btn primary" data-step>One Gradient Step</button><button class="v5-btn" data-auto>Auto Run</button><button class="v5-btn" data-best>Show Best Fit</button><button class="v5-btn" data-reset>Reset</button></div>
      </div></aside>
    </div>
    <div class="mqcal-metrics"><div><small>SLOPE</small><b data-mm></b></div><div><small>INTERCEPT</small><b data-bm></b></div><div><small>MSE LOSS</small><b data-loss></b></div><div><small>STEP</small><b data-iter></b></div></div>
    <div class="mqcal-grid">
      <section class="mqcal-panel"><h3>2 · Loss landscape</h3><p>Every point on this map is one slope/intercept choice. The center of the smallest contour is the global minimum.</p><svg class="mqcal-svg" data-landscape viewBox="0 0 720 400"></svg></section>
      <section class="mqcal-panel"><h3>3 · Loss over training steps</h3><p>If Gradient Descent is working, loss should generally move downward. A learning rate that is too large can make it jump upward.</p><svg class="mqcal-svg" data-history viewBox="0 0 720 400"></svg></section>
    </div>
    <div class="mqcal-explain" data-explain></div>
    <div class="mqcal-minima">
      <article><h4>Global minimum</h4><p>The lowest loss anywhere on the entire landscape. For ordinary Linear Regression with squared-error loss, the surface is bowl-shaped, so the best solution is the global minimum.</p><svg class="mqcal-svg" viewBox="0 0 360 150"><path d="M25 28 Q180 215 335 28" fill="none" stroke="#777" stroke-width="5"/><circle cx="180" cy="120" r="8" fill="#fff"/><text x="190" y="124" fill="#fff" font-size="13">global minimum</text></svg></article>
      <article><h4>Local minimum</h4><p>A place lower than nearby points, but not necessarily the lowest place overall. Complex neural-network landscapes can contain many valleys, flat regions and saddle points.</p><svg class="mqcal-svg" viewBox="0 0 360 150"><path d="M20 40 Q70 130 120 70 Q170 20 215 115 Q270 175 340 30" fill="none" stroke="#777" stroke-width="5"/><circle cx="92" cy="91" r="7" fill="#aaa"/><text x="43" y="118" fill="#aaa" font-size="12">local</text><circle cx="230" cy="119" r="8" fill="#fff"/><text x="240" y="124" fill="#fff" font-size="12">global</text></svg></article>
    </div>
  </div>`}
  function mount(){
    const host=document.querySelector('.mq12-model1');if(!host||host.dataset.calMounted)return;
    host.dataset.calMounted='1';host.outerHTML=html();
    const root=document.querySelector('#mqCalLab');if(!root)return;
    state={m:12,b:2,lr:.02,iter:0,history:[mse(12,2)],path:[[12,2]]};
    const q=s=>root.querySelector(s),mEl=q('[data-m]'),bEl=q('[data-b]'),lrEl=q('[data-lr]');
    const sx=x=>65+x/2.2*600,sy=y=>370-y/60*300;
    function graph(){let s='';for(let y=0;y<=60;y+=10)s+=`<line x1="65" y1="${sy(y)}" x2="665" y2="${sy(y)}" stroke="#181818"/><text x="52" y="${sy(y)+4}" text-anchor="end" fill="#777" font-size="11">${y}</text>`;for(let x=0;x<=2.2;x+=.4)s+=`<line x1="${sx(x)}" y1="70" x2="${sx(x)}" y2="370" stroke="#181818"/>`;for(const [x,y] of DATA){const yp=state.m*x+state.b;s+=`<line x1="${sx(x)}" y1="${sy(y)}" x2="${sx(x)}" y2="${sy(yp)}" stroke="#666" stroke-width="3" stroke-dasharray="5 5"/><circle cx="${sx(x)}" cy="${sy(y)}" r="8" fill="#fff"/>`}s+=`<line x1="${sx(0)}" y1="${sy(state.b)}" x2="${sx(2.2)}" y2="${sy(state.m*2.2+state.b)}" stroke="#aaa" stroke-width="4"/><text x="280" y="410" fill="#888">voltage (V) →</text><text x="10" y="28" fill="#888">force (N) ↑</text>`;q('[data-graph]').innerHTML=s}
    function landscape(){const mx=m=>60+(m/45)*610,by=b=>345-((b+15)/35)*270;let s='<rect x="60" y="55" width="610" height="290" rx="14" fill="#07090c" stroke="#333"/>';const cx=mx(OPT.m),cy=by(OPT.b);[[240,105],[185,80],[130,57],[82,36]].forEach((r,i)=>s+=`<ellipse cx="${cx}" cy="${cy}" rx="${r[0]}" ry="${r[1]}" fill="none" stroke="#${['333','555','888','bbb'][i]}" stroke-width="2"/>`);if(state.path.length>1){s+=`<polyline points="${state.path.map(([m,b])=>`${mx(Math.max(0,Math.min(45,m)))},${by(Math.max(-15,Math.min(20,b)))}`).join(' ')}" fill="none" stroke="#aaa" stroke-width="3" stroke-dasharray="5 5"/>`}const out=state.m<0||state.m>45||state.b<-15||state.b>20;s+=`<circle cx="${mx(Math.max(0,Math.min(45,state.m)))}" cy="${by(Math.max(-15,Math.min(20,state.b)))}" r="9" fill="#fff"/>`+`<circle cx="${cx}" cy="${cy}" r="6" fill="#777"/>`+`<text x="${cx+10}" y="${cy+4}" fill="#aaa" font-size="12">global minimum</text><text x="305" y="382" fill="#888">slope →</text><text x="10" y="40" fill="#888">intercept ↑</text>`+(out?'<text x="70" y="80" fill="#fff" font-size="13">current point is outside this map</text>':'');q('[data-landscape]').innerHTML=s}
    function history(){const h=state.history,max=Math.max(...h,1),min=Math.min(...h,0);const X=i=>55+(i/Math.max(1,h.length-1))*610,Y=v=>340-((v-min)/(Math.max(.001,max-min)))*255;let s='<line x1="55" y1="340" x2="665" y2="340" stroke="#444"/><line x1="55" y1="60" x2="55" y2="340" stroke="#444"/>';if(h.length>1)s+=`<polyline points="${h.map((v,i)=>`${X(i)},${Y(v)}`).join(' ')}" fill="none" stroke="#fff" stroke-width="4"/>`;h.forEach((v,i)=>s+=`<circle cx="${X(i)}" cy="${Y(v)}" r="${i===h.length-1?7:4}" fill="${i===h.length-1?'#fff':'#777'}"/>`);s+=`<text x="290" y="382" fill="#888">training step →</text><text x="10" y="35" fill="#888">loss ↑</text>`;q('[data-history]').innerHTML=s}
    function explain(){const [dm,db]=grad(state.m,state.b),loss=mse(state.m,state.b);const zone=state.lr<.008?'very small: learning will be slow':state.lr>.12?'large: steps may overshoot the low-loss region':'useful range for this small example';q('[data-explain]').innerHTML=`<b>What Gradient Descent is doing:</b> the current line has loss <b>${loss.toFixed(2)}</b>. The slope gradient is <b>${dm.toFixed(2)}</b> and intercept gradient is <b>${db.toFixed(2)}</b>. A gradient tells how loss changes when a parameter moves. We move in the opposite direction because we want lower loss. Learning rate ${state.lr.toFixed(3)} is <b>${zone}</b>.<br><br><b>Update rule:</b> new parameter = old parameter − learning rate × gradient.`}
    function draw(){q('[data-mout]').textContent=state.m.toFixed(2)+' N/V';q('[data-bout]').textContent=state.b.toFixed(2)+' N';q('[data-lrout]').textContent=state.lr.toFixed(3);q('[data-mm]').textContent=state.m.toFixed(2)+' N/V';q('[data-bm]').textContent=state.b.toFixed(2)+' N';q('[data-loss]').textContent=mse(state.m,state.b).toFixed(2);q('[data-iter]').textContent=String(state.iter);mEl.value=state.m;bEl.value=Math.max(-15,Math.min(15,state.b));lrEl.value=state.lr;graph();landscape();history();explain()}
    function step(){const [dm,db]=grad(state.m,state.b);state.m-=state.lr*dm;state.b-=state.lr*db;state.iter++;state.history.push(mse(state.m,state.b));state.path.push([state.m,state.b]);if(state.history.length>50){state.history.shift();state.path.shift()}draw()}
    mEl.oninput=()=>{state.m=+mEl.value;state.history=[mse(state.m,state.b)];state.path=[[state.m,state.b]];state.iter=0;draw()};bEl.oninput=()=>{state.b=+bEl.value;state.history=[mse(state.m,state.b)];state.path=[[state.m,state.b]];state.iter=0;draw()};lrEl.oninput=()=>{state.lr=+lrEl.value;draw()};
    q('[data-step]').onclick=step;q('[data-best]').onclick=()=>{state.m=OPT.m;state.b=OPT.b;state.iter++;state.history.push(mse(state.m,state.b));state.path.push([state.m,state.b]);draw()};q('[data-reset]').onclick=()=>{clearInterval(timer);timer=null;q('[data-auto]').textContent='Auto Run';state={m:12,b:2,lr:.02,iter:0,history:[mse(12,2)],path:[[12,2]]};draw()};q('[data-auto]').onclick=()=>{if(timer){clearInterval(timer);timer=null;q('[data-auto]').textContent='Auto Run'}else{q('[data-auto]').textContent='Pause';timer=setInterval(step,380)}};
    draw();
  }
  const obs=new MutationObserver(()=>mount());
  function start(){mount();const v=document.querySelector('#view');if(v)obs.observe(v,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();