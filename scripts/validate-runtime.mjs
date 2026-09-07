import fs from 'node:fs';

const errors=[];
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"/g)].map(m=>m[1]);

for(const src of [...scripts,...styles]){
  if(/^https?:\/\//i.test(src))errors.push(`External runtime dependency remains: ${src}`);
  else if(!fs.existsSync(src))errors.push(`Missing local asset referenced by index.html: ${src}`);
}
const expectedScripts=['curriculum-v11.js','labs-v10.js','world-canonical-v12.js','calibration-lab.js','quality-v11.js','search-help.js'];
if(JSON.stringify(scripts)!==JSON.stringify(expectedScripts))errors.push(`Unexpected runtime script set/order: ${scripts.join(' -> ')}`);

const world=fs.readFileSync('world-canonical-v12.js','utf8');
for(const token of ['globalThis.go=go','globalThis.showHome=showLanding','function showMap()','function renderQuest()','function screen0','function screen7'])if(!world.includes(token))errors.push(`Canonical renderer contract missing: ${token}`);
if(!/localStorage\.setItem/.test(world))errors.push('Canonical renderer does not save progress.');
if(!/reason\.length<20/.test(world))errors.push('Boss challenge reasoning gate is missing.');

const calibration=fs.readFileSync('calibration-lab.js','utf8');
for(const token of ['One Gradient Step','Loss landscape','Global minimum','Local minimum','new parameter = old parameter'])if(!calibration.includes(token))errors.push(`Model 1 canonical lab missing: ${token}`);
if(!/function mse/.test(calibration)||!/function grad/.test(calibration))errors.push('Model 1 lab must calculate actual MSE and gradients.');

const labs=fs.readFileSync('labs-v10.js','utf8');
if(!/window\.mqLabFor/.test(labs)||!/window\.mqInitLab/.test(labs))errors.push('Lab bridge functions are missing.');
for(let id=2;id<=13;id++)if(!new RegExp(`\\n\\s*${id}:\\{`).test(labs))errors.push(`Lab config missing Model ${id}`);

const quality=fs.readFileSync('quality-v11.js','utf8');
for(const token of ['MQ_OPEN_BASE_CAMP','mq11-prereq','mq11-code-readiness','mq11-worked','mq11-failure','mq11-gate'])if(!quality.includes(token))errors.push(`Teaching overlay contract missing: ${token}`);
const search=fs.readFileSync('search-help.js','utf8');
if(!/MQ_CURRICULUM/.test(search)||!/globalThis\.go/.test(search))errors.push('Search/help is not connected to canonical curriculum/navigation.');

if(errors.length){console.error('\nRuntime validation failed:\n- '+errors.join('\n- '));process.exit(1)}
console.log(`Runtime validation passed: ${scripts.length} canonical scripts, ${styles.length} local styles, no legacy renderer or external JS.`);