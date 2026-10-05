/* =====================================================================
   CREATIVE-GENERATOR · Kaiser Fahrzeugbau GmbH
   ---------------------------------------------------------------------
   Rendert die Meta-Ads-Creatives aus einer Config – im CI der
   Karriereseite (gleiches Rot #982222, gleiche Schriften Archivo/Inter,
   gleiches Logo).

       node creatives/build.mjs

   Es wird AUSSCHLIESSLICH das Bildmaterial aus bilder/ verwendet.
   Je Stelle ein eigenes Motiv: drei verschiedene Ausschnitte aus dem
   grossen Kopfbild plus die beiden Einzelfotos.

   Neue Stelle / anderes Motiv / neues Format: unten in STELLEN bzw.
   FORMATE ergaenzen und neu rendern.
   ===================================================================== */

import { createRequire } from 'module';
const require_ = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require_('playwright')); }
catch { ({ chromium } = require_('playwright-core')); }
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT  = HERE;

/* ---------- CI · identisch mit dem :root-Block in index.html ---------- */
const CI = {
  brand:     '#982222',   // exakt aus dem Original-Logo
  brandDark: '#7d1c1c',
  ink:       '#1f1d1d',
  inkDeep:   '#151212',
  soft:      '#f8ebeb'
};

/* ---------- Schriften lokal einbetten (offline identisch) ---------- */
const face = (fam, w, f) =>
  `@font-face{font-family:${fam};font-style:normal;font-weight:${w};font-display:block;` +
  `src:url(data:font/woff2;base64,${readFileSync(join(HERE,'fonts',f)).toString('base64')}) format('woff2')}`;
const FONTS = [
  face('Archivo',700,'archivo-latin-700-normal.woff2'),
  face('Archivo',800,'archivo-latin-800-normal.woff2'),
  face('Archivo',900,'archivo-latin-900-normal.woff2'),
  face('Inter',400,'inter-latin-400-normal.woff2'),
  face('Inter',500,'inter-latin-500-normal.woff2'),
  face('Inter',600,'inter-latin-600-normal.woff2'),
  face('Inter',700,'inter-latin-700-normal.woff2')
].join('\n');

function dataUri(rel){
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  const ext = rel.split('.').pop().toLowerCase();
  const mime = ext==='svg' ? 'image/svg+xml' : ext==='png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${readFileSync(p).toString('base64')}`;
}

const LOGO = ['bilder/Logo-KAISER-FAHRZEUGBAU-weiss.svg','bilder/kaiser-logo-weiss.svg','bilder/logo-weiss.svg']
  .map(dataUri).find(Boolean);

/* ---------- Fotos ----------
   KOPFBILD ist 2000x667 und enthaelt drei klar unterscheidbare Szenen.
   Ueber posX waehlen wir den Ausschnitt (background-position in %).
   bandH steuert die Hoehe des Fotobandes: je kleiner die Quelle, desto
   flacher das Band, damit der Hochskalierungsfaktor nicht explodiert. */
const KOPFBILD = 'bilder/Kopfbild_OffeneStellen_202505.jpg';
const FOTOS = {
  schleifer: { src: KOPFBILD, posX: 24, quelle: [2000,667] },   // Schleifen, Funkenflug
  rahmen:    { src: KOPFBILD, posX: 56, quelle: [2000,667] },   // Aufbau/Rahmen am Fahrzeug
  schweisser:{ src: KOPFBILD, posX: 100, quelle: [2000,667] },  // Schweissen, heller Lichtbogen
  kran:      { src: 'bilder/csm_Karriere_Fahrzeugbauer1_red_c1157d1502.jpg', posX: 50, quelle: [550,365] },
  hof:       { src: 'bilder/csm_Ladekran8_ba82e6b4a6.jpg',                   posX: 50, quelle: [367,244] }
};

/* ---------- Stellen ---------- */
const BENEFITS_STD = ['30 Tage Urlaub', 'Urlaubs- & Weihnachtsgeld', 'Überstundenkonto'];

const STELLEN = [
  {
    key:'mechatroniker', foto:'schleifer', prio:true, bandH:792,
    titel:['Mechatroniker','(m/w/d)'],
    hook:'Montage, Wartung und Reparatur an Nutzfahrzeugen, Land- und Baumaschinen.',
    benefits: BENEFITS_STD
  },
  {
    key:'fahrzeugelektriker', foto:'schweisser', prio:true, bandH:792,
    titel:['Fahrzeugelektriker','Kfz-Elektrik (m/w/d)'],
    hook:'Fahrzeugelektrik, Steuerungstechnik und moderne Diagnosesysteme.',
    benefits: BENEFITS_STD
  },
  {
    key:'fahrzeugbauer', foto:'rahmen', prio:true, bandH:792,
    titel:['Fahrzeugbauer','Karosserie (m/w/d)'],
    hook:'Aufbauten fertigen, montieren und instand setzen.',
    benefits: BENEFITS_STD
  },
  {
    key:'personal', foto:'hof', prio:false, bandH:718,
    titel:['Personalsachbearbeitung','Lohnbuchhaltung (m/w/d)'],
    hook:'Lohnabrechnung und Personalbetreuung im Familienunternehmen.',
    benefits:['30 Tage Urlaub', 'Urlaubs- & Weihnachtsgeld', 'Vollzeit oder Teilzeit']
  },
  {
    key:'ausbildung', foto:'kran', prio:false, bandH:716,
    titel:['Ausbildung','(m/w/d)'],
    hook:'Richtung Fahrzeugbau oder Kfz-Service und Servicetechnik.',
    benefits:['30 Tage Urlaub', 'Urlaubs- & Weihnachtsgeld', 'Start bis ca. 01.11. möglich']
  }
];

/* ---------- Formate ---------- */
const FORMATE = [{ name:'9x16', w:1080, h:1920 }];

/* ---------- Haken-Icon ---------- */
const HAKEN = `<svg viewBox="0 0 24 24" fill="none" stroke="${CI.brand}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;

/* Meta 9:16: oben ca. 250px und unten ca. 340px koennen von der
   Oberflaeche (Profilname, Button, Kommentare) ueberlagert werden.
   Alles Wichtige bleibt dazwischen. */
const SAFE_TOP = 250, SAFE_BOTTOM = 340;

function html(st, fmt, extraTop = 0){
  const f = FOTOS[st.foto];
  const foto = dataUri(f.src);
  const k = fmt.h / 1920;                       // Skalierung fuer andere Formate
  const px = v => Math.round(v * k);
  const bandH = px(st.bandH);
  const lang  = st.titel[0].length > 20;        // lange Stellenbezeichnung
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
${FONTS}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${fmt.w}px;height:${fmt.h}px}
body{font-family:Inter,sans-serif;background:${CI.ink};color:#fff;overflow:hidden;
     display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}

/* --- Fotoband oben --- */
.foto{position:relative;flex:0 0 ${bandH}px;overflow:hidden;background:${CI.inkDeep}}
.foto__img{position:absolute;inset:0;
  ${foto ? `background-image:url('${foto}');` : ''}
  background-size:cover;background-position:${f.posX}% center;
  filter:saturate(1.06) contrast(1.04)}
.foto::before{content:"";position:absolute;inset:0 0 auto 0;height:${px(420)}px;z-index:2;
  background:linear-gradient(180deg,rgba(21,18,18,.78),rgba(21,18,18,0))}
.foto::after{content:"";position:absolute;inset:auto 0 0 0;height:${px(260)}px;z-index:2;
  background:linear-gradient(180deg,rgba(31,29,29,0),${CI.ink})}

.kopf{position:absolute;top:${px(SAFE_TOP + 36)}px;left:${px(76)}px;right:${px(76)}px;z-index:3;
      display:flex;align-items:center;justify-content:space-between;gap:${px(24)}px}
.kopf img{height:${px(82)}px;width:auto;display:block}
.badge{display:inline-flex;align-items:center;background:${CI.brand};color:#fff;
  font-family:Archivo;font-weight:800;font-size:${px(24)}px;letter-spacing:.09em;text-transform:uppercase;
  padding:${px(13)}px ${px(22)}px;border-radius:999px;white-space:nowrap}

/* --- Untere Flaeche: Text oben, CTA unten, dazwischen flexibler Raum --- */
.unten{flex:1;min-height:0;display:flex;flex-direction:column;
       padding:${px(30) + Math.round(extraTop)}px ${px(76)}px ${px(SAFE_BOTTOM)}px}
.eyebrow{display:flex;align-items:center;gap:${px(15)}px;
  font-family:Archivo;font-weight:800;font-size:${px(25)}px;letter-spacing:.14em;text-transform:uppercase;color:#e9b4b4}
.eyebrow i{display:block;width:${px(15)}px;height:${px(15)}px;border-radius:50%;background:${CI.brand};flex:0 0 auto}
h1{font-family:Archivo;font-weight:900;font-size:${px(lang ? 64 : 80)}px;line-height:1.05;
   letter-spacing:-.022em;margin-top:${px(22)}px}
h1 em{font-style:normal;display:block;font-size:.8em;opacity:.93}
.hook{font-size:${px(32)}px;font-weight:400;line-height:1.4;color:#ddd7d5;margin-top:${px(20)}px}
.rule{height:${px(4)}px;width:${px(104)}px;background:${CI.brand};border-radius:${px(2)}px;margin:${px(28)}px 0 ${px(24)}px}
.bens{display:grid;gap:${px(17)}px}
.ben{display:flex;align-items:center;gap:${px(18)}px;font-size:${px(31)}px;font-weight:600;color:#fff}
.ben svg{width:${px(36)}px;height:${px(36)}px;flex:0 0 auto}

.fuss{margin-top:auto;padding-top:${px(28)}px}
.cta{display:flex;align-items:center;justify-content:center;gap:${px(16)}px;background:${CI.brand};color:#fff;
  font-family:Archivo;font-weight:800;font-size:${px(40)}px;padding:${px(32)}px ${px(28)}px;border-radius:${px(16)}px}
.cta svg{width:${px(38)}px;height:${px(38)}px;stroke:#fff;stroke-width:2.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.meta{display:flex;align-items:center;justify-content:center;gap:${px(18)}px;margin-top:${px(22)}px;
  font-size:${px(26)}px;font-weight:500;color:#a9a2a0}
.meta b{color:#ddd7d5;font-weight:700}
</style></head><body>

<div class="foto">
  <div class="foto__img"></div>
  <div class="kopf">
    ${LOGO ? `<img src="${LOGO}" alt="Kaiser Fahrzeugbau">` : `<div style="font-family:Archivo;font-weight:900;font-size:${px(56)}px">KAISER</div>`}
    ${st.prio ? `<span class="badge">Dringend gesucht</span>` : ``}
  </div>
</div>

<div class="unten">
  <div class="panel">
    <div class="eyebrow"><i></i>Ascheberg · Nutzfahrzeugbau</div>
    <h1>${st.titel[0]}<em>${st.titel[1]}</em></h1>
    <p class="hook">${st.hook}</p>
    <div class="rule"></div>
    <div class="bens">
      ${st.benefits.map(b=>`<div class="ben">${HAKEN}<span>${b}</span></div>`).join('')}
    </div>
  </div>
  <div class="fuss">
    <div class="cta">Jetzt in 60 Sekunden bewerben
      <svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </div>
    <div class="meta"><span>Ohne Lebenslauf</span>·<span>Ohne Anschreiben</span>·<b>kaiser-fahrzeugbau.de</b></div>
  </div>
</div>

</body></html>`;
}

/* ---------- Rendern + pruefen ---------- */
const browser = await chromium.launch();
mkdirSync(OUT, { recursive:true });
let fehler = 0;
console.log('Rendere Creatives …\n');
for (const fmt of FORMATE){
  for (const st of STELLEN){
    const ctx = await browser.newContext({ viewport:{width:fmt.w,height:fmt.h}, deviceScaleFactor:1 });
    const page = await ctx.newPage();

    /* Zwei Durchlaeufe: im ersten messen wir, wie viel Luft zwischen
       Textblock und CTA bleibt, im zweiten setzen wir den Text um die
       Haelfte davon tiefer. So steht er mittig im freien Raum, statt
       unter kurzen Texten eine Luecke ueber dem Button zu lassen. */
    await page.setContent(html(st,fmt), { waitUntil:'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(220);
    const luftRoh = await page.evaluate(() => {
      const p=document.querySelector('.panel').getBoundingClientRect();
      const f=document.querySelector('.fuss').getBoundingClientRect();
      return Math.round(f.top - p.bottom);
    });
    const extraTop = Math.max(0, Math.round(luftRoh / 2) - 14);
    await page.setContent(html(st,fmt,extraTop), { waitUntil:'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(260);

    /* Layout nachmessen: nichts darf sich ueberlagern, nichts darf aus dem
       Bild laufen, und alles Wichtige bleibt in der Sicherheitszone. */
    const chk = await page.evaluate(({safeTop,safeBottom,H,W}) => {
      const r = s => { const e=document.querySelector(s); if(!e) return null;
                       const b=e.getBoundingClientRect();
                       return {top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left),right:Math.round(b.right)}; };
      const panel=r('.panel'), fuss=r('.fuss'), kopf=r('.kopf'), cta=r('.cta'), meta=r('.meta');
      const probleme=[];
      if (panel && fuss && panel.bottom > fuss.top) probleme.push(`Text ueberlagert CTA um ${panel.bottom-fuss.top}px`);
      if (kopf  && kopf.top  < safeTop)     probleme.push(`Logo/Badge ${safeTop-kopf.top}px zu weit oben (Sicherheitszone)`);
      if (meta  && meta.bottom > H-safeBottom) probleme.push(`Fusszeile ${meta.bottom-(H-safeBottom)}px in der unteren Sicherheitszone`);
      if (cta   && (cta.left < 0 || cta.right > W)) probleme.push('CTA laeuft seitlich aus dem Bild');
      [...document.querySelectorAll('.panel *,.fuss *,.kopf *')].forEach(e=>{
        const b=e.getBoundingClientRect();
        if (b.width && (b.right > W+1 || b.left < -1 || b.bottom > H+1)) probleme.push(`<${e.tagName.toLowerCase()}> ragt aus dem Bild`);
      });
      return {probleme:[...new Set(probleme)], panelBottom:panel&&panel.bottom, fussTop:fuss&&fuss.top};
    }, {safeTop:Math.round(SAFE_TOP*fmt.h/1920), safeBottom:Math.round(SAFE_BOTTOM*fmt.h/1920), H:fmt.h, W:fmt.w});

    const datei = `${st.key}-${fmt.name}.png`;
    await page.screenshot({ path: join(OUT, datei) });
    const f = FOTOS[st.foto];
    const band = Math.round(st.bandH * fmt.h / 1920);
    const skal = Math.max(fmt.w / f.quelle[0], band / f.quelle[1]);
    const luft = chk.fussTop - chk.panelBottom;
    const status = chk.probleme.length ? 'FEHLER: ' + chk.probleme.join('; ') : `ok (Text mittig, Luft ${luft}px)`;
    if (chk.probleme.length) fehler++;
    console.log(`  ${datei.padEnd(30)} ${f.quelle[0]}x${f.quelle[1]} -> ${skal.toFixed(2)}x  ${status}`);
    await ctx.close();
  }
}
await browser.close();
console.log(fehler ? `\n${fehler} Creative(s) mit Layoutfehler.` : '\nAlle Creatives ok. Dateien liegen in creatives/.');
