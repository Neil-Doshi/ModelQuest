import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('curriculum-v11.js','utf8');
const labs = fs.readFileSync('labs-v10.js','utf8');
const quality = fs.readFileSync('quality-v11.js','utf8');
const index = fs.readFileSync('index.html','utf8');
const sandbox = { PROJECTS: Array.from({length:13},(_,i)=>({id:i+1})), console };
vm.createContext(sandbox);
vm.runInContext(source, sandbox, {filename:'curriculum-v11.js'});
const C = sandbox.MQ_CURRICULUM;
const errors = [];
const req = ['id','title','subtitle','hook','goal','prerequisites','concepts','missions','baseline','expected','environment','challenge','real','code','sources'];

if(!Array.isArray(C) || C.length !== 13) errors.push(`Expected 13 curriculum records, found ${Array.isArray(C)?C.length:'none'}`);
if(Array.isArray(C)){
  const ids=C.map(x=>x.id);
  if(new Set(ids).size!==13 || ids.some((id,i)=>id!==i+1)) errors.push('Model IDs must be unique and ordered 1 through 13.');
  for(const m of C){
    for(const k of req){
      const v=m[k];
      if(v==null || v==='' || (Array.isArray(v)&&v.length===0)) errors.push(`Model ${m.id}: missing ${k}`);
    }
    if(!String(m.hook).includes('?')) errors.push(`Model ${m.id}: hook should be framed as a learner question.`);
    const code=String(m.code).toLowerCase();
    const stale=['practice_hours','student score','hours + sleep','player styles','breast cancer','fashion-mnist','imdb','movie review'];
    for(const bad of stale) if(code.includes(bad)) errors.push(`Model ${m.id}: stale domain phrase in code: ${bad}`);
  }
  const m3=C.find(x=>x.id===3)?.code||'';
  if(!m3.includes('Unscaled KNN') || !m3.includes('StandardScaler')) errors.push('Model 3 must demonstrate broken unscaled KNN and the scaled repair.');
  const m6=C.find(x=>x.id===6)?.code||'';
  if(!/range\(2,\s*9\)/.test(m6)) errors.push('Model 6 challenge requires K=2..8, so code must use range(2, 9).');
  const m13=C.find(x=>x.id===13);
  if(!/retrieval quality first/i.test(m13?.code||'')) errors.push('Model 13 must make retrieval quality the capstone success criterion.');
}

for(let id=2;id<=13;id++){
  if(!new RegExp(`\\n\\s*${id}:\\{title:`).test(labs)) errors.push(`TRY IT lab configuration missing for Model ${id}.`);
}
if(!/6:\{title:'Hidden Modes[^\n]+\['Clusters \(K\)',2,8,3,1\]/.test(labs)) errors.push('Model 6 TRY IT lab must allow K through 8.');
if(!/future_repair_flag/.test(labs) || !/data-demo/.test(labs)) errors.push('Model 5 TRY IT lab must contain an explicit leakage demonstration.');
if(!/lr>\.28/.test(labs) || !/state\.loss=Math\.min\(3,state\.loss\*\(1\+overshoot\)\)/.test(labs)) errors.push('Model 7 TRY IT lab must visibly model too-large learning-rate failure.');

for(const name of ['const WORKED=','const FAILURE=','const GATES=','NUMBERS BEFORE SYMBOLS','BREAK IT ON PURPOSE','UNDERSTANDING CHECK']){
  if(!quality.includes(name)) errors.push(`quality-v11.js missing teaching contract: ${name}`);
}
for(let id=1;id<=13;id++){
  if(!new RegExp(`\\n\\s*${id}:\\{`).test(quality)) errors.push(`quality-v11.js appears to be missing Model ${id} teaching data.`);
}

const order=['data.js','curriculum-v11.js','app.js','world-current.js','foundation-v9.js','labs-v10.js','quality-v11.js'];
let prev=-1;
for(const file of order){
  const pos=index.indexOf(`src="${file}"`);
  if(pos<0) errors.push(`index.html does not load ${file}.`);
  if(pos>=0 && pos<prev) errors.push(`index.html script order is wrong around ${file}.`);
  if(pos>=0) prev=pos;
}

if(errors.length){
  console.error('\nCurriculum validation failed:\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log('Curriculum validation passed: 13 coherent engineering quests, aligned labs, numeric teaching, failure demonstrations and understanding checks.');
