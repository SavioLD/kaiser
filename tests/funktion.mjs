import { createRequire } from 'module';
/* Playwright wird per require aufgeloest: funktioniert sowohl mit lokalem
   "npm i -D playwright" als auch mit einer global installierten Version. */
const require_ = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require_('playwright')); }
catch { ({ chromium } = require_('playwright-core')); }

import {fileURLToPath} from 'url';
import {dirname,join} from 'path';
const URL = 'file://'+join(dirname(fileURLToPath(import.meta.url)),'..','index.html');
const JOBS = ['mechatroniker','fahrzeugelektriker','fahrzeugbauer','personal','ausbildung'];
let fails = 0;
const bad = (m) => { fails++; console.log('  ✗ ' + m); };
const ok  = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch();

// Capture every outbound webhook POST, block the real request.
async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
  const page = await ctx.newPage();
  const sent = [];
  await page.route('**api-v2.lead-table.com**', async (route) => {
    sent.push({ url: route.request().url(), body: route.request().postData() });
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  // Blockierte Fonts/Analytics und die absichtlichen Bild-Probes (bilder/* fehlen noch)
  // sind KEINE JS-Fehler - nur echte Exceptions zaehlen.
  return { page, sent, errors, ctx };
}

// Click the Nth choice (1-based) on the active step, then wait for advance.
async function pick(page, n) {
  const sel = `.fstep.is-active .choice:nth-of-type(${n})`;
  await page.evaluate(s => document.querySelector(s).click(), sel);
  await page.waitForTimeout(450);
}

console.log('\n=== 1. MOBILE LAUFRUHE (390x844) ===');
{
  const { page, errors, ctx } = await newPage({ width: 390, height: 844 });
  await page.goto(URL);
  await page.evaluate(() => document.querySelector('#bewerbung').scrollIntoView());
  // scroll-behavior:smooth -> warten, bis die Animation wirklich steht,
  // sonst misst der erste Messpunkt mitten in der Bewegung.
  await (async () => { let last=null,same=0;
    for (let i=0;i<80;i++){ const y=await page.evaluate(()=>Math.round(window.scrollY));
      if(y===last){ if(++same>=3) return; } else { same=0; last=y; }
      await page.waitForTimeout(50); } })();

  const scrolls = [], heights = [], overflow = [];
  const snap = async () => {
    const s = await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      h: Math.round(document.querySelector('.form-card__body').getBoundingClientRect().height),
      cardTop: Math.round(document.querySelector('.form-card').getBoundingClientRect().top),
      cardBot: Math.round(document.querySelector('.form-card').getBoundingClientRect().bottom),
      vh: window.innerHeight,
      label: document.getElementById('stepLabel').textContent
    }));
    scrolls.push(s.y); heights.push(s.h);
    // Does the whole card fit on screen without scrolling?
    overflow.push({ label: s.label, fits: (s.cardBot - s.cardTop) <= s.vh });
    return s;
  };

  await snap();
  await pick(page, 1);            // Stelle: Mechatroniker
  await snap();
  for (let i = 0; i < 5; i++) { await pick(page, 1); await snap(); }  // 5 Fragen, je Antwort A

  const uniqueY = [...new Set(scrolls)];
  if (uniqueY.length === 1) ok(`Viewport bleibt exakt stehen über alle Schritte (scrollY=${uniqueY[0]}, 7 Messpunkte)`);
  else bad(`Viewport springt: scrollY-Werte ${JSON.stringify(scrolls)}`);

  const uniqueH = [...new Set(heights)];
  if (uniqueH.length === 1) ok(`Formularhöhe konstant: ${uniqueH[0]}px über alle Schritte`);
  else bad(`Formularhöhe springt: ${JSON.stringify(heights)}`);

  const tooTall = overflow.filter(o => !o.fits);
  if (!tooTall.length) ok(`Jeder Schritt passt komplett auf 390x844 ohne Scrollen`);
  else bad(`Zu hoch auf dem Handy: ${tooTall.map(t => t.label).join(', ')}`);

  if (!errors.length) ok('Keine JS-Fehler'); else bad('JS-Fehler: ' + errors.join(' | '));
  await ctx.close();
}

console.log('\n=== 2. K.-O.-ABBRUCH sendet NICHTS ===');
{
  const { page, sent, ctx } = await newPage({ width: 390, height: 844 });
  await page.goto(URL);
  await page.evaluate(() => document.querySelector('#bewerbung').scrollIntoView());
  await pick(page, 1);   // Mechatroniker
  await pick(page, 4);   // Qualifikation: "Weder Ausbildung noch Erfahrung" -> K.O.
  const screenout = await page.isVisible('#screenoutView');
  const navHidden = await page.evaluate(() => getComputedStyle(document.getElementById('formNav')).display === 'none');
  if (screenout) ok('Abbruch-Ansicht erscheint sofort nach der Pflichtfrage'); else bad('Kein K.-o.-Abbruch');
  if (navHidden) ok('Keine weiteren Schritte möglich (Navigation ausgeblendet)'); else bad('Navigation noch aktiv');
  await page.waitForTimeout(500);
  if (sent.length === 0) ok('Kein Lead an die Lead Table gesendet'); else bad('K.-o. wurde übertragen!');
  const txt = await page.textContent('#screenoutView');
  if (!/stelle|position|weitere/i.test(txt.replace(/Für diese Stelle/i,''))) ok('Keine anderen Stellen im Abbruchtext angeboten');
  await ctx.close();
}

console.log('\n=== 3. VOLLSTÄNDIGE BEWERBUNG JE STELLE -> PAYLOAD ===');
const payloads = {};
for (let j = 0; j < JOBS.length; j++) {
  const { page, sent, errors, ctx } = await newPage({ width: 390, height: 844 });
  await page.goto(URL);
  await page.evaluate(() => document.querySelector('#bewerbung').scrollIntoView());
  await pick(page, j + 1);
  const total = await page.evaluate(() => +document.getElementById('stepLabel').textContent.match(/von (\d+)/)[1]);
  for (let i = 0; i < 5; i++) await pick(page, 1);   // alle Pflichtfragen erfüllt
  await page.fill('#vorname', 'Max');
  await page.fill('#nachname', 'Mustermann');
  await page.fill('#telefon', '0151 23456789');
  await page.fill('#email', 'max@beispiel.de');
  await page.evaluate(()=>document.getElementById('btnNext').click());
  await page.waitForTimeout(700);
  const success = await page.isVisible('#successView');
  const name = JOBS[j];
  if (sent.length !== 1) { bad(`${name}: ${sent.length} Requests statt 1`); await ctx.close(); continue; }
  const p = JSON.parse(sent[0].body);
  payloads[name] = { url: sent[0].url, p, total };
  const tableId = JSON.parse(Buffer.from(sent[0].url.split('/').pop().split('.')[1], 'base64').toString()).tableID;
  console.log(`  ${name}: Schritte=${total}, tableID=${tableId}, Erfolgsseite=${success}`);
  // Feldprüfungen
  const keys = Object.keys(p);
  const dupes = keys.filter(k => /^(name|fullname|vollstaendiger_name|voller_name)$/i.test(k));
  if (dupes.length) bad(`${name}: verbotenes Sammelfeld ${dupes.join(',')}`);
  if (keys.length !== new Set(keys).size) bad(`${name}: doppelte Keys`);
  if (p.vorname !== 'Max' || p.nachname !== 'Mustermann') bad(`${name}: Name falsch`);
  if (p.telefon !== '0151 23456789') bad(`${name}: Telefon falsch`);
  if (p.email !== 'max@beispiel.de') bad(`${name}: E-Mail falsch`);
  // Kein Feld darf den Namen ein zweites Mal enthalten
  const echo = keys.filter(k => !['vorname','nachname'].includes(k) && typeof p[k] === 'string' && /Mustermann/.test(p[k]));
  if (echo.length) bad(`${name}: Name taucht zusätzlich in ${echo.join(',')} auf`);
  if (errors.length) bad(`${name}: JS-Fehler ${errors.join('|')}`);
  await ctx.close();
}

console.log('\n=== 4. WEBHOOK-ZUORDNUNG (jede Stelle eigene Kachel) ===');
{
  const urls = Object.entries(payloads).map(([k, v]) => [k, v.url]);
  const ids = urls.map(([k, u]) => [k, JSON.parse(Buffer.from(u.split('/').pop().split('.')[1], 'base64').toString()).tableID]);
  const uniq = new Set(ids.map(i => i[1]));
  if (uniq.size === ids.length) ok(`Alle ${ids.length} Stellen senden an unterschiedliche Kacheln`);
  else bad('Mehrere Stellen teilen sich eine Kachel: ' + JSON.stringify(ids));
  ids.forEach(([k, id]) => console.log(`    ${k.padEnd(20)} -> ${id}`));
}

console.log('\n=== 5. OPTIONALE FRAGE: weiter + als nicht erfüllt markiert ===');
{
  const { page, sent, ctx } = await newPage({ width: 390, height: 844 });
  await page.goto(URL);
  await page.evaluate(() => document.querySelector('#bewerbung').scrollIntoView());
  await pick(page, 1);  // Mechatroniker
  await pick(page, 1);  // Qualifikation OK (Pflicht)
  await pick(page, 3);  // Erfahrung: "Noch keine Erfahrung" -> optional, nicht erfüllt
  const stillRunning = await page.isVisible('.fstep.is-active');
  if (stillRunning) ok('Bewerber kommt bei nicht erfüllter Optionalfrage normal weiter'); else bad('Fälschlich abgebrochen');
  await pick(page, 1); await pick(page, 1); await pick(page, 1);
  await page.fill('#vorname','Erika'); await page.fill('#nachname','Beispiel');
  await page.fill('#telefon','01512345678'); await page.fill('#email','e@b.de');
  await page.evaluate(()=>document.getElementById('btnNext').click()); await page.waitForTimeout(700);
  const p = JSON.parse(sent[0].body);
  if (/Hydraulik|Erfahrung/i.test(p.nicht_erfuellt)) ok(`nicht_erfuellt = "${p.nicht_erfuellt}"`);
  else bad(`nicht_erfuellt nicht gesetzt: "${p.nicht_erfuellt}"`);
  if (p.erfahrung_technik) ok(`Antwort trotzdem übertragen: "${p.erfahrung_technik}"`);
  await ctx.close();
}

console.log('\n=== 6. DEEPLINK ?stelle= ===');
for (const k of ['mechatroniker','fahrzeugelektriker','fahrzeugbauer','personal','ausbildung','kfz-elektrik','azubi']) {
  const { page, ctx } = await newPage({ width: 390, height: 844 });
  await page.goto(URL + '?stelle=' + k);
  await page.waitForTimeout(250);
  const label = await page.textContent('#stepLabel');
  const h1 = await page.textContent('#heroTitle');
  const stelleHidden = await page.evaluate(() => document.getElementById('stepStelle').hidden);
  console.log(`  ${k.padEnd(20)} -> Hero "${h1}" | ${label} | Auswahlschritt übersprungen: ${stelleHidden}`);
  if (!stelleHidden) bad(`${k}: Auswahlschritt nicht übersprungen`);
  await ctx.close();
}

console.log('\n=== 7. BEISPIEL-PAYLOAD (Mechatroniker) ===');
console.log(JSON.stringify(payloads.mechatroniker.p, null, 2));

console.log('\n=== 8. DESKTOP-RENDER ===');
{
  const { page, errors, ctx } = await newPage({ width: 1440, height: 900 });
  await page.goto(URL);
  await page.waitForTimeout(400);
  const counts = await page.evaluate(() => ({
    prio: document.querySelectorAll('#jobGridPrio .job').length,
    rest: document.querySelectorAll('#jobGridRest .job').length,
    benefits: document.querySelectorAll('.benefit').length,
    faq: document.querySelectorAll('.faq details').length,
    ld: !!document.querySelector('script[type="application/ld+json"]'),
    hscroll: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log('  ', JSON.stringify(counts));
  if (counts.prio === 3 && counts.rest === 2) ok('3 Prio-Stellen + 2 weitere'); else bad('Stellenanzahl falsch');
  if (!counts.hscroll) ok('Kein horizontaler Scroll'); else bad('Horizontaler Scroll');
  if (errors.length) bad('JS-Fehler: ' + errors.join('|'));
  await page.screenshot({ path: new URL('./desktop.png', import.meta.url).pathname, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log(fails === 0 ? '\n>>> ALLE TESTS BESTANDEN' : `\n>>> ${fails} FEHLER`);
