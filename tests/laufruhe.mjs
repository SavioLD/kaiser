import { createRequire } from 'module';
/* Playwright wird per require aufgeloest: funktioniert sowohl mit lokalem
   "npm i -D playwright" als auch mit einer global installierten Version. */
const require_ = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require_('playwright')); }
catch { ({ chromium } = require_('playwright-core')); }
import {fileURLToPath} from 'url';
import {dirname,join} from 'path';
const URL='file://'+join(dirname(fileURLToPath(import.meta.url)),'..','index.html');
const JOBS=['mechatroniker','fahrzeugelektriker','fahrzeugbauer','personal','ausbildung'];
let fails=0; const bad=m=>{fails++;console.log('  ✗ '+m)}; const ok=m=>console.log('  ✓ '+m);
const browser=await chromium.launch();

async function settle(page){
  let last=null,same=0;
  for(let i=0;i<80;i++){
    const y=await page.evaluate(()=>Math.round(window.scrollY));
    if(y===last){ if(++same>=3) return y; } else { same=0; last=y; }
    await page.waitForTimeout(50);
  }
  return last;
}
// click WITHOUT the harness scrolling: dispatch directly in the page
const tap=(page,sel)=>page.evaluate(s=>{const e=document.querySelector(s); if(!e) throw new Error('missing '+s); e.click();},sel);

for (const vp of [{width:320,height:568},{width:360,height:640},{width:375,height:667},{width:390,height:844},{width:412,height:915},{width:430,height:932}]){
  console.log(`\n=== VIEWPORT ${vp.width}x${vp.height} ===`);
  for (const job of JOBS){
    const ctx=await browser.newContext({viewport:vp,isMobile:true,hasTouch:true});
    const page=await ctx.newPage();
    const jsErrors=[]; page.on('pageerror',e=>jsErrors.push(String(e)));
    await page.route('**api-v2.lead-table.com**',r=>r.fulfill({status:200,body:'{}'}));
    await page.goto(URL);
    await page.evaluate(()=>document.querySelector('#bewerbung').scrollIntoView());
    await settle(page);
    const ys=[],hs=[],docs=[],fits=[],labels=[];
    const grab=async(tag)=>{
      const s=await page.evaluate(()=>{
        const c=document.querySelector('.form-card').getBoundingClientRect();
        return {y:Math.round(window.scrollY),h:Math.round(document.querySelector('.form-card__body').getBoundingClientRect().height),
                doc:Math.round(document.documentElement.scrollHeight),ch:Math.round(c.height),vh:Math.round((window.visualViewport&&window.visualViewport.height)||window.innerHeight),
                lab:document.getElementById('stepLabel').textContent};
      });
      ys.push(s.y);hs.push(s.h);docs.push(s.doc);fits.push(s.ch<=s.vh);labels.push(tag+':'+s.lab);
    };
    await grab('start');
    await tap(page,`.fstep.is-active .choice:nth-of-type(${JOBS.indexOf(job)+1})`);
    await page.waitForTimeout(450); await grab('stelle');
    for(let i=0;i<5;i++){ await tap(page,'.fstep.is-active .choice:nth-of-type(1)'); await page.waitForTimeout(450); await grab('q'+(i+1)); }
    await tap(page,'#btnBack'); await page.waitForTimeout(350); await grab('back1');
    await tap(page,'#btnBack'); await page.waitForTimeout(350); await grab('back2');
    const drift=Math.max(...ys)-Math.min(...ys);
    const docDrift=Math.max(...docs)-Math.min(...docs);
    const label=`${vp.width}px ${job}`;
    if(drift===0) ok(`${label}: scrollY konstant ${ys[0]} über ${ys.length} Messpunkte (inkl. 2x Zurück)`);
    else bad(`${label}: scrollY driftet ${drift}px -> ${JSON.stringify(ys)} @ ${labels.join(',')}`);
    if(docDrift===0) ok(`${label}: Seitenhöhe konstant ${docs[0]}px`);
    else bad(`${label}: Seitenhöhe ändert sich um ${docDrift}px -> ${JSON.stringify(docs)}`);
    if([...new Set(hs)].length===1) ok(`${label}: Containerhöhe konstant ${hs[0]}px`); else bad(`${label}: Containerhöhe ${JSON.stringify([...new Set(hs)])}`);
    if(fits.every(Boolean)) ok(`${label}: jeder Schritt ohne Scrollen sichtbar`); else bad(`${label}: Schritt zu hoch`);
    if(jsErrors.length) bad(`${label}: JS-Exception ${jsErrors.join('|')}`);
    await ctx.close();
  }
}
await browser.close();
console.log(fails===0?'\n>>> MOBILE LAUFRUHE: ALLE TESTS BESTANDEN':`\n>>> ${fails} FEHLER`);
