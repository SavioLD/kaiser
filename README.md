# Kaiser Fahrzeugbau – Karriereseite

Recruiting-Landingpage der **Kaiser Fahrzeugbau GmbH**, Ascheberg.
Aufbau und Sektionsreihenfolge 1:1 wie die ALWA-Referenzseite, Texte und CI
auf Kaiser Fahrzeugbau angepasst.

Ausgeschriebene Stellen – **und ausschließlich diese fünf**:

| Priorität | Stelle | Lead-Table-Kachel (tableID) |
|---|---|---|
| **Dringend gesucht** | Mechatroniker (m/w/d) | `6ac36607199534b0eb10c2c5` |
| **Dringend gesucht** | Fahrzeugelektriker / Kfz-Elektrik (m/w/d) | `6ac3667e199534b0eb11852d` |
| **Dringend gesucht** | Fahrzeugbauer / Karosserie (m/w/d) | `6ac3670adb4bfecb20ad4254` |
| Außerdem offen | Personalsachbearbeitung / Lohnbuchhaltung (m/w/d) | `6ac36723db4bfecb20ad72e6` |
| Außerdem offen | Ausbildung (m/w/d) | `6ac36747199534b0eb1323ab` |

Die drei priorisierten Stellen stehen in einem eigenen Block **„Dringend
gesucht"** ganz oben, mit rotem Badge und hervorgehobener Karte. Es gibt
bewusst **keine** Sammelbegriffe, keine Initiativbewerbung, keinen Bereich
„weitere offene Stellen" und keine Verlinkung auf andere Vakanzen.

## Inhalt

- `index.html` – die komplette Seite (self-contained, kein Build-Schritt nötig)
- `bilder/` – hier Logo und Hero-Foto ablegen (siehe `bilder/HIER-BILDER-ABLEGEN.txt`)
- `.nojekyll` – sorgt dafür, dass GitHub Pages die Dateien 1:1 ausliefert

## Live schalten (GitHub Pages)

1. Repo-Settings → **Pages** → Source: **Deploy from a branch**,
   Branch: `claude/jolly-pascal-04bbn8` (oder nach dem Merge `main`) / `/root`
2. Nach ein paar Minuten unter `https://saviold.github.io/kaiser/` erreichbar

---

## ⚠️ Zwei Punkte, die noch deine Freigabe brauchen

### 1. Logo auf Dunkel ist eine erzeugte Weiß-Variante

Das CI steht jetzt **exakt**: Das Original-Logo
`bilder/Logo-KAISER-FAHRZEUGBAU.svg` verwendet genau **einen** Farbwert –
**`#982222`**. Genau der ist als `--brand` gesetzt, alle weiteren Rottöne
sind davon abgeleitet, die Neutraltöne sind ein warmes Anthrazit
(`#1f1d1d`), das zum Backsteinrot passt. Angepasst wird weiterhin nur im
`:root`-Block ganz oben in `index.html`.

Das Logo ist einfarbig rot. Auf dem dunklen Hero und im dunklen Footer
hätte Rot auf Anthrazit nur ca. 2,4:1 Kontrast – unlesbar. Deshalb liegt
dort eine **Weiß-Variante**: `bilder/Logo-KAISER-FAHRZEUGBAU-weiss.svg`.
Sie ist aus dem Original erzeugt, indem ausschließlich der Füllwert
`#982222` → `#ffffff` getauscht wurde. **Alle Pfade, Proportionen und das
Seitenverhältnis sind unverändert** – es ist kein Nachbau, sondern die
übliche Negativ-/Knockout-Fassung für dunkle Flächen.

👉 Wenn es eine **offizielle** Negativ-Version aus dem Styleguide gibt,
einfach unter diesem Dateinamen ersetzen – die Seite zieht sie automatisch.

Verwendet wird:

| Datei | Einsatz |
|---|---|
| `Logo-KAISER-FAHRZEUGBAU.svg` | Kopfzeile (heller Hintergrund), im Original-Rot |
| `Logo-KAISER-FAHRZEUGBAU-weiss.svg` | Hero und Footer (dunkler Hintergrund) |
| `Kopfbild_OffeneStellen_202505.jpg` | Hero-Foto (2000 × 667) |

**Noch nicht verwendet**, weil zu klein:
`csm_Karriere_Fahrzeugbauer1_red_c1157d1502.jpg` (550 × 365) und
`csm_Ladekran8_ba82e6b4a6.jpg` (367 × 244). Beides sind von der Website
heruntergerechnete Varianten. Für die Seite wären sie nur als kleine
Akzentbilder brauchbar, für Meta-Creatives (1080 × 1350 bzw. 1080 × 1920)
reichen sie nicht – da bräuchte ich die **Originale in voller Auflösung**.

### 2. Anforderungen „Personalsachbearbeitung / Lohnbuchhaltung"

Im Briefing stand unter der Überschrift *„Pflicht (K.-o.-Kriterien) für
Personalsachbearbeitung / Lohnbuchhaltung"* eine rein **technische**
Anforderungsliste (Fahrzeugelektrik, Schaltpläne, Mess- und Prüfgeräte,
Hydraulik, Diagnosesysteme). Das ist erkennbar die Liste der
**Fahrzeugelektriker-Stelle**.

So wurde es umgesetzt:

- Die technische Liste steht **bei Fahrzeugelektriker / Kfz-Elektrik** –
  dort gehört sie inhaltlich hin.
- Für **Personalsachbearbeitung / Lohnbuchhaltung** stehen stellentypische
  kaufmännische Kriterien (abgeschlossene kaufmännische Ausbildung,
  Erfahrung in Lohn-/Gehaltsabrechnung bzw. Personalsachbearbeitung,
  Lohnsteuer-/SV-Recht, Abrechnungssoftware wie DATEV, Sorgfalt, Diskretion).
  Das vorgegebene **„in Vollzeit oder Teilzeit"** ist übernommen.

👉 Wenn die echten Anforderungen für diese Stelle anders lauten: Sag Bescheid,
das ist **ein** Eintrag in `JOBS` (`key:"personal"` → `must`, `profil`, `fragen`).

---

## Stellen pflegen

Alle fünf Stellen stehen in **einer** Config (`var JOBS` im `<script>` am
Seitenende). Sie speist gleichzeitig:

- die Stellenkarten in „Offene Stellen" (Prio-Block und „Außerdem offen")
- die Stellenauswahl im Formular
- **den Fragenkatalog des Formulars**
- den Hero-Text bei `?stelle=…`
- die JobPosting-Structured-Data

Eine Stelle ändern heißt also: **einen** Eintrag anfassen.

```js
{ key:"mechatroniker", title:"Mechatroniker (m/w/d)", kurz:"Mechatroniker",
  icon:ICONS.mechatroniker, prio:true,          // prio -> Block "Dringend gesucht"
  webhook:WH.mechatroniker,                     // eigene Lead-Table-Kachel
  teaser:"…",         // Einzeiler in der Formular-Auswahl
  hook:"…",           // Hero-Text bei ?stelle=mechatroniker
  aliase:[…],         // weitere Schreibweisen für den Deeplink
  tags:[…],
  aufgaben:[…],       // "Deine Aufgaben"
  must:[…],           // "Das setzen wir voraus" = die K.-o.-Kriterien
  profil:[…],         // "Das bringst du mit"
  fragen:[…] }        // 5 Formularfragen, s. u.
```

Die **Benefits sind laut Kunde für alle Stellen gleich** und stehen deshalb
genau einmal in `var BENEFITS`. Sie werden in jede Stellenkarte unter
„Das bieten wir dir" gerendert.

> **Betriebliche Altersvorsorge** wird bewusst **nicht** als Standard-Benefit
> kommuniziert. Sie taucht nur einmal im FAQ auf, mit dem Hinweis, dass
> bestehende Verträge individuell geprüft/fortgeführt werden können.

Der Block **„Das setzen wir voraus"** einer Stelle enthält exakt die
K.-o.-Kriterien, die das Screening später prüft – so verlangt die Anzeige
nichts anderes als das Formular.

## Das Formular

Jede Stelle hat ihren **eigenen Fragenkatalog mit 5 Fragen** – die
Anforderungen unterscheiden sich zu stark für einen gemeinsamen Satz.
Der Katalog wird eingesetzt, sobald die Stelle feststeht.

```js
{ field:"qualifikation",     // = Key im Webhook-Payload
  label:"Qualifikation",     // Name im Feld "nicht_erfuellt"
  pflicht:true,              // true = K.-o.-Frage
  frage:"Deine Qualifikation",
  hinweis:"Bitte ehrlich auswählen.",
  optionen:[ {t:"Antworttext", s:"Unterzeile", v:"Wert für die Lead Table", ok:true}, … ] }
```

- `ok:true` → Antwort erfüllt das Kriterium
- `pflicht:true` + Antwort ohne `ok` → **Bewerbung endet sofort.** Freundlicher
  Abschlusshinweis, **keine** anderen Stellen werden angeboten, **kein Lead**
  geht an die Lead Table.
- `pflicht:false` + Antwort ohne `ok` → Bewerber kommt **ganz normal weiter**;
  die Antwort wird übertragen **und** im Feld `nicht_erfuellt` als nicht
  erfüllt markiert.

Pro Stelle 2–3 Pflicht- und 2–3 Optionalfragen. Es wird **eine Frage pro
Schritt** angezeigt, damit der K.-o.-Abbruch sauber greift.

Abgefragt werden ausschließlich **berufsbezogene** Kriterien – keine Fragen zu
Alter, Herkunft, Gesundheit, Religion oder Familienstand (AGG).
**Kein Lebenslauf-Upload, keine Dateianhänge.**

### Mobile Laufruhe

Der Schrittwechsel ändert ausschließlich Klassen, Breite und Text:

- **kein** `window.scrollTo`, **kein** `scrollIntoView`, **kein** `focus()`,
  kein Reload, kein Anker-/Hash-Sprung
- feste Mindesthöhe des Formularcontainers über **alle** Schritte
  (`--form-min` / `--form-min-mobile`) – auch in der Mobile-Query gesetzt
- Fortschrittsanzeige und Weiter-Button bleiben an fester Position
  (`margin-top:auto`)
- Ein Klick auf eine Antwortkachel würde normalerweise das versteckte
  Radio **fokussieren** – Chrome scrollt fokussierte Elemente von sich aus
  in den sichtbaren Bereich. Genau das ist unterbunden
  (`blockFocusScroll`), ohne dass Tastaturbedienung verloren geht.

Das einzige bewusste `scrollIntoView` steckt im Button „Jetzt bewerben" auf
einer Stellenkarte – das ist Navigation zum Formular, kein Schrittwechsel.

## Stellen-Deeplinks für die Anzeige

Die Anzeige kann direkt auf eine Stelle verlinken. Die Seite textet dann den
Hero auf die Stelle, wählt sie im Formular vor und **überspringt den
Auswahl-Schritt** (6 statt 7 Schritte):

```
…/kaiser/?stelle=mechatroniker
…/kaiser/?stelle=fahrzeugelektriker     (auch: kfz-elektrik, elektriker, …)
…/kaiser/?stelle=fahrzeugbauer          (auch: karosserie, karosseriebauer, …)
…/kaiser/?stelle=personal               (auch: lohnbuchhaltung, hr, …)
…/kaiser/?stelle=ausbildung             (auch: azubi, lehre, …)
```

## Lead Table – Feldzuordnung

Gesendet wird **nur bei einer vollständigen, qualifizierten Bewerbung** an die
Kachel der jeweiligen Stelle. K.-o.-Abbrüche verlassen die Seite nie.

```json
{
  "vorname": "Max",
  "nachname": "Mustermann",
  "telefon": "0151 23456789",
  "email": "max@beispiel.de",
  "stelle": "Mechatroniker (m/w/d)",
  "qualifikation": "…",
  "erfahrung_technik": "…",
  "deutschkenntnisse": "…",
  "verfuegbarkeit": "…",
  "anfahrt": "…",
  "nicht_erfuellt": "–",
  "datum": "05.10.2026",
  "datenschutz": "Ja (Einwilligung mit Absenden, Art. 6 Abs. 1 lit. a DSGVO)",
  "quelle": "Karriere-Landingpage Kaiser Fahrzeugbau",
  "seite": "https://…"
}
```

**Vorname und Nachname sind zwei getrennte Felder.** Es wird bewusst **kein**
kombiniertes Feld (`name`, `vollstaendiger_name`, `fullname`) mitgeschickt –
sonst stünde der Name in der Lead Table doppelt. Jedes Feld wird genau einmal
gesendet, es gibt keine Dubletten und keine Sammelfelder.

Die Frage-Felder unterscheiden sich je Stelle (jede hat ihre eigene Kachel).

## Qualitätssicherung

Die Seite wurde automatisiert im echten Browser (Chromium) getestet –
Testskripte unter `tests/`:

- **Kein horizontales Scrollen** auf 320–1440 px: `scrollWidth` entspricht
  exakt dem Viewport, kein Element ragt heraus.
- **Mobile Laufruhe** auf 320/360/375/390/412/430 px Breite × 5 Stellen:
  `scrollY` bleibt über alle Schrittwechsel **exakt konstant** (inkl. Zurück),
  Seitenhöhe konstant, Containerhöhe konstant.
- Jeder Schritt ist auf allen gängigen Handygrößen (ab 360×640) **ohne
  Scrollen vollständig sichtbar**. Einzige Ausnahme: 320×568 (iPhone SE
  von 2016) – dort ist die Karte ca. 100 px höher als der sichtbare
  Bereich, es muss also einmal gescrollt werden. Springen tut auch dort
  nichts. Ab iPhone SE 2./3. Generation (375×667) passt alles.
- K.-o.-Abbruch: Abbruchansicht erscheint sofort, Navigation wird
  ausgeblendet, **kein Request** an die Lead Table.
- Optionale Frage nicht erfüllt: Bewerber läuft normal weiter, Antwort wird
  übertragen und in `nicht_erfuellt` markiert.
- Alle fünf Stellen senden an **fünf unterschiedliche** Kacheln.
- Payload je Stelle geprüft: keine doppelten Keys, kein kombiniertes
  Namensfeld, Name/Telefon/E-Mail je genau einmal und im richtigen Feld.
- Deeplinks für alle Stellen inkl. Aliase.

```bash
node tests/laufruhe.mjs   # Scroll-/Höhenstabilität
node tests/funktion.mjs   # K.-o.-Logik, Payloads, Webhooks, Deeplinks
```

### Behobener Fehler: Seite ließ sich am Handy seitlich schieben

Grid-Spuren mit `1fr` haben implizit `min-width:auto` und können deshalb
**nicht** unter die min-content-Breite ihres Inhalts schrumpfen. In der
Trust-Leiste hat das lange Kompositum „Familienunternehmen" die Spalte
aufgespannt, zwei Spalten ergaben 512 px – mehr als jedes Handy breit ist.
Folge: Die Seite ließ sich seitlich schieben und war am Rand abgeschnitten.
`body{overflow-x:hidden}` hat das nicht aufgefangen, weil der Überlauf
real war und nicht nur optisch.

Behoben durch `minmax(0,1fr)` in **allen** Grids (Trust, Benefits, Ablauf,
Formularzeile) plus `min-width:0` und Worttrennung in der Trust-Leiste;
unter 560 px steht sie jetzt einspaltig. Der Test oben deckt genau diesen
Fall ab.

> **Noch offen:** Ein **echter Testeintrag** in der Lead Table konnte aus der
> Build-Umgebung nicht abgesetzt werden – `api-v2.lead-table.com` ist von der
> Netzwerk-Policy der Session blockiert. Die Requests wurden im Test
> abgefangen und der Payload vollständig geprüft; der Versand selbst muss
> einmal von einem normalen Browser aus gegengeprüft werden (eine
> Testbewerbung pro Stelle absenden und in der Kachel kontrollieren, dass
> Name, Telefon und E-Mail je einmal im richtigen Feld stehen).
