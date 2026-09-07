import fs from 'node:fs';
import path from 'node:path';

const errors=[];
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(m=>m[1]);

for(const src of [...scripts,...styles]){
  if(/^https?:\/\//i.test(src)) errors.push(`External runtime dependency remains in index.html: ${src}`);
  else if(!fs.existsSync(src)) errors.push(`index.html references missing local asset: ${src}`);
}

const requiredOrder=['data.js','curriculum-v11.js','app.js','world-current.js','labs-v10.js','quality-v11.js','search-help.js'];
let last=-1;
for(const name of requiredOrder){
  const i=scripts.indexOf(name);
  if(i<0) errors.push(`Missing required runtime script: ${name}`);
  else if(i<last) errors.push(`Script load order is unsafe around ${name}`);
  last=Math.max(last,i);
}

const labs=fs.readFileSync('labs-v10.js','utf8');
for(let id=2;id<=13;id++) if(!new RegExp(`\\n\\s*${id}:\\{`).test(labs)) errors.push(`Interactive lab config missing Model ${id}`);
if(!/window\.mqLabFor/.test(labs)||!/window\.mqInitLab/.test(labs)) errors.push('Lab bridge functions are missing.');
if(!/Inject future_repair_flag/.test(labs)) errors.push('Model 5 leakage demo is missing.');
if(!/Clusters \(K\)',2,8/.test(labs)) errors.push('Model 6 lab must allow K=2 through 8.');
if(!/lr>\.28/.test(labs)) errors.push('Model 7 must visibly model an oversized learning-rate failure.');
if(!/Prompt-injection lesson/.test(labs)) errors.push('Model 13 must demonstrate untrusted retrieved text.');

const quality=fs.readFileSync('quality-v11.js','utf8');
for(let id=1;id<=13;id++){
  if(!new RegExp(`\\n\\s*${id}:\\{title:`).test(quality)) errors.push(`Worked numeric example missing Model ${id}`);
}
if(!/REPRODUCIBLE RUN/.test(quality)) errors.push('Advanced environment/version guidance is missing.');
if(!/Runtime → Change runtime type → choose a GPU/.test(quality)) errors.push('Literal Colab GPU path is missing.');

const world=fs.readFileSync('world-current.js','utf8');
if(!/mqLabFor\(p\.id\)/.test(world)||!/mqInitLab\(p\.id\)/.test(world)) errors.push('World renderer is not connected to the current lab bridge.');

if(errors.length){
  console.error('\nRuntime validation failed:\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log(`Runtime validation passed: ${scripts.length} local scripts, ${styles.length} local styles, 12 advanced labs, no external JS dependency.`);
