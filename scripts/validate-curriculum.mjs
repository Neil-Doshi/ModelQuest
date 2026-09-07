import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('curriculum-v11.js','utf8');
const labs=fs.readFileSync('labs-v10.js','utf8');
const quality=fs.readFileSync('quality-v11.js','utf8');
const world=fs.readFileSync('world-canonical-v12.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sandbox={console};
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'curriculum-v11.js'});
const C=sandbox.MQ_CURRICULUM;
const errors=[];
const req=['id','stage','title','subtitle','difficulty','time','hook','goal','prerequisites','concepts','missions','baseline','expected','environment','challenge','real','code','sources'];

if(!Array.isArray(C)||C.length!==13)errors.push(`Expected 13 canonical curriculum records, found ${Array.isArray(C)?C.length:'none'}`);
if(Array.isArray(C)){
  const ids=C.map(x=>x.id);
  if(new Set(ids).size!==13||ids.some((id,i)=>id!==i+1))errors.push('Canonical model IDs must be unique and ordered 1 through 13.');
  for(const m of C){
    for(const k of req){const v=m[k];if(v==null||v===''||(Array.isArray(v)&&v.length===0))errors.push(`Model ${m.id}: missing ${k}`)}
    if(!String(m.hook).includes('?'))errors.push(`Model ${m.id}: WHY hook must be a learner question.`);
    if((m.prerequisites||[]).length<2)errors.push(`Model ${m.id}: prerequisite chain is too thin.`);
    if((m.missions||[]).length<4)errors.push(`Model ${m.id}: HOW chain needs at least four steps.`);
    const code=String(m.code).toLowerCase();
    for(const bad of ['practice_hours','student score','hours + sleep','player styles','breast cancer','fashion-mnist','imdb','movie review'])if(code.includes(bad))errors.push(`Model ${m.id}: stale domain phrase in code: ${bad}`);
  }
  const m3=C.find(x=>x.id===3)?.code||'';
  if(!m3.includes('Unscaled KNN')||!m3.includes('StandardScaler'))errors.push('Model 3 must visibly break and repair KNN scaling.');
  const m6=C.find(x=>x.id===6)?.code||'';
  if(!/range\(2,\s*9\)/.test(m6))errors.push('Model 6 runnable challenge must allow K=2 through 8.');
  if(!/retrieval quality first/i.test(C.find(x=>x.id===13)?.code||''))errors.push('Model 13 must make retrieval quality the capstone criterion.');
}

if(!/MQ_CURRICULUM/.test(world))errors.push('Canonical world must consume MQ_CURRICULUM directly.');
if(/const\s+Q\s*=/.test(world))errors.push('Canonical world must not carry a second full Q curriculum object.');
for(const token of ['c.hook','c.goal','c.challenge','c.code','c.real','c.baseline','c.expected','c.prerequisites','c.missions'])if(!world.includes(token))errors.push(`Canonical world is not directly consuming ${token}.`);

for(let id=2;id<=13;id++)if(!new RegExp(`\\n\\s*${id}:\\{`).test(labs))errors.push(`Interactive lab config missing Model ${id}.`);
if(!/Inject future_repair_flag/.test(labs))errors.push('Model 5 leakage demo is missing.');
if(!/Clusters \(K\)',2,8/.test(labs))errors.push('Model 6 lab must allow K=2 through 8.');
if(!/lr>\.28/.test(labs))errors.push('Model 7 must model oversized learning-rate failure.');
if(!/Prompt-injection lesson/.test(labs))errors.push('Model 13 must demonstrate untrusted retrieved text.');

for(const name of ['const WORKED=','const FAILURE=','const GATES=','NUMBERS BEFORE SYMBOLS','BREAK IT ON PURPOSE','UNDERSTANDING CHECK'])if(!quality.includes(name))errors.push(`quality-v11.js missing teaching contract: ${name}`);

const retired=['data.js','app.js','guide.js','theory.js','studio-v4.js','world-current.js','explanations-v6.js','learning-v7.js','clarity-v8.js','foundation-v9.js','foundation-v9-hotfix.js'];
for(const file of retired)if(index.includes(`src="${file}"`))errors.push(`Retired layered runtime is still loaded: ${file}`);
for(const file of ['curriculum-v11.js','labs-v10.js','world-canonical-v12.js','quality-v11.js','search-help.js'])if(!index.includes(`src="${file}"`))errors.push(`Canonical runtime file not loaded: ${file}`);

if(errors.length){console.error('\nCanonical curriculum validation failed:\n- '+errors.join('\n- '));process.exit(1)}
console.log('Canonical curriculum validation passed: one curriculum source feeds the live 13-quest renderer, labs and teaching overlays.');