/* ModelQuest search + contextual recovery. Uses the canonical curriculum instead of literal legacy keywords. */
(()=>{
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const curriculum=()=>globalThis.MQ_CURRICULUM||[];
  const INTENTS=[
    [/model (is )?(bad|wrong)|bad model|high accuracy.*bad|works.*training.*not.*new/i,'overfitting generalization validation distribution shift leakage'],
    [/false alarm|too many alarms|reject.*good|good.*rejected/i,'threshold precision false reject quality gate'],
    [/miss.*defect|miss.*failure|not catching|catch more/i,'recall threshold class imbalance predictive maintenance'],
    [/cluster.*weird|too many cluster|wrong cluster/i,'kmeans cluster centroid k silhouette hidden machine modes'],
    [/too slow.*learn|learning.*slow|loss.*stuck|overshoot|learning rate/i,'gradient descent learning rate neural network loss'],
    [/curve|straight line|slope|per volt/i,'linear regression slope rate of change sensor calibration'],
    [/tree.*memor|too deep|overfit.*tree/i,'decision tree depth pruning overfitting'],
    [/image|scratch|pit|filter|convolution/i,'cnn convolution filter pooling surface defect'],
    [/memory|sequence|history|forecast|future leak/i,'lstm rnn sequence time split energy forecast'],
    [/word meaning|attention|token|bearing.*meaning|transformer/i,'transformer attention token embedding maintenance notes'],
    [/lora|fine.?tun|adapter|rank|quant/i,'lora adapter rank quantization technician report'],
    [/rag|retriev|wrong answer|document|chunk|top.?k|halluc/i,'rag retrieval chunk top-k grounding engineering copilot'],
    [/colab|notebook|cell|pip|install|gpu|runtime|traceback|python error|package/i,'BASE_CAMP']
  ];
  function expand(q){let s=String(q||'').trim().toLowerCase();for(const [re,terms] of INTENTS)if(re.test(s))s+=' '+terms;return s;}
  function score(q,m){
    const words=[...new Set(expand(q).split(/[^a-z0-9+#.-]+/).filter(x=>x.length>1))];
    const title=`${m.title} ${m.subtitle}`.toLowerCase();
    const concepts=(m.concepts||[]).join(' ').toLowerCase();
    const body=[m.hook,m.goal,m.challenge,...(m.real||[]),...(m.prerequisites||[])].join(' ').toLowerCase();
    let n=0;for(const w of words){if(title.includes(w))n+=5;if(concepts.includes(w))n+=3;if(body.includes(w))n+=1;}return n;
  }
  function run(){
    const input=document.querySelector('#searchInput'),out=document.querySelector('#results');if(!input||!out)return;
    const raw=input.value.trim();
    if(!raw){out.innerHTML='<div class="answer">Try: “why is my model bad”, “too many false alarms”, “loss is going up”, “why is RAG wrong”, or “how do I run Colab”.</div>';return;}
    const expanded=expand(raw),base=expanded.includes('BASE_CAMP');
    const hits=curriculum().map(m=>({m,n:score(raw,m)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,7);
    let html='';
    if(base)html+='<div class="result" data-basecamp><b>Base Camp — Colab, cells, errors, installs, GPU and runtime basics</b><br><small>Start here when the blocker is the computer rather than the ML idea.</small></div>';
    html+=hits.map(({m})=>`<div class="result" data-mq-result="${m.id}"><b>${m.id}. ${esc(m.title)} — ${esc(m.subtitle)}</b><br><small>${esc(m.hook)}</small></div>`).join('');
    if(!html)html='<div class="answer">I could not map that phrase yet. Try describing the symptom: “missed failures”, “tree memorizes”, “clusters weird”, “attention confusing”, or “code error”.</div>';
    out.innerHTML=html;
    out.querySelector('[data-basecamp]')?.addEventListener('click',()=>{document.querySelector('#searchModal')?.classList.remove('open');globalThis.MQ_OPEN_BASE_CAMP?.();});
    out.querySelectorAll('[data-mq-result]').forEach(x=>x.addEventListener('click',()=>{document.querySelector('#searchModal')?.classList.remove('open');if(typeof globalThis.go==='function')globalThis.go(Number(x.dataset.mqResult));}));
  }

  function current(){
    const text=document.querySelector('.v5-quest-title .v5-kicker')?.textContent||document.querySelector('.eyebrow')?.textContent||'';
    const m=text.match(/MODEL\s+0?(\d+)/i);const id=m?Number(m[1]):null;
    return {id,c:id?curriculum().find(x=>x.id===id):null,step:(document.querySelector('.v5-step.active b')?.textContent||'').trim()};
  }
  function contextualStuck(){
    const modal=document.querySelector('#stuckModal'),opts=document.querySelector('#stuckOpts'),answer=document.querySelector('#stuckAnswer');if(!modal||!opts||!answer)return;
    const {c,step}=current();modal.classList.add('open');
    const items={
      'I do not understand why this exists':c?`Return to the WHY chain for ${c.title}. Ask: what information do we have, what answer is missing, and why was the previous/simple method insufficient?`:'Open Base Camp, then start with Model 1.',
      'I do not understand a word':c?`Do not memorize it yet. In ${c.title}, find the problem that forced that word to exist. Current prerequisites: ${(c.prerequisites||[]).join(' · ')}.`:'Use Base Camp prerequisite bridges first.',
      'The math lost me':'Use the Numbers Before Symbols example on the math screen. Work through the arithmetic first; only then read the formula.',
      'The lab surprised me':`Current screen: ${step||'interactive work'}. Reset the lab, predict one change in writing, move one control only, and compare the visual plus metric before touching a second control.`,
      'My code has an error':'Start at the bottom of the traceback. Find the first line pointing to your code. Print the relevant value/shape, check package versions, and change one thing at a time.',
      'My result is different':c?`Compare against this lesson anchor first: ${c.expected} Small variation can come from versions or neural-network randomness; large differences need investigation.`:'Check random seed, data split and package versions.',
      'I forgot a prerequisite':c?`This quest expects: ${(c.prerequisites||[]).join(' · ')}. Use Base Camp for the missing bridge instead of rereading the whole course.`:'Open Base Camp.'
    };
    opts.innerHTML=Object.keys(items).map(x=>`<button data-mq-stuck="${esc(x)}">${esc(x)}</button>`).join('');answer.innerHTML=c?`<div class="answer"><b>${esc(c.title)}</b><br>${esc(step||'Choose what is blocking you.')}</div>`:'';
    opts.querySelectorAll('[data-mq-stuck]').forEach(b=>b.onclick=()=>{const text=items[b.dataset.mqStuck];answer.innerHTML=`<div class="answer"><b>${esc(b.dataset.mqStuck)}</b><br>${esc(text)}<div style="margin-top:10px"><button class="btn" data-open-base>Open Base Camp / bridges</button></div></div>`;answer.querySelector('[data-open-base]')?.addEventListener('click',()=>{modal.classList.remove('open');globalThis.MQ_OPEN_BASE_CAMP?.();});});
  }

  function install(){
    const input=document.querySelector('#searchInput');if(input){input.placeholder='Describe the problem: “too many false alarms”, “loss going up”, “RAG wrong”…';input.oninput=run;}
    globalThis.openStuck=contextualStuck;
    const close=document.querySelector('#closeStuck');if(close)close.onclick=()=>document.querySelector('#stuckModal')?.classList.remove('open');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
