# 🎓 Akademia — Menaxheri i Studentëve

**Projekt shabllon për kursin _JavaScript Advanced_ · 7Scantech Academy, Prishtinë**

Një aplikacion i vetëm, pa `npm install`, pa build, që demonstron **çdo temë** të
syllabus-it 12-javor. Është ndërtuar mbi projektin e Javës 11 (`week11_student_manager`),
por i rishkruar si projekt "i vërtetë": 27 module, arkitekturë me shtresa,
trajtim gabimesh, dhe një laborator interaktiv për konceptet e vështira.

---

## 🚀 Si t'a hapni (30 sekonda)

1. Hapeni folderin në **VS Code**.
2. Instaloni ekstensionin **Live Server** (Ritwick Dey) nëse nuk e kini.
3. Klik i djathtë mbi `index.html` → **Open with Live Server**.
4. Shfletuesi hapet në `http://127.0.0.1:5500` — gati.

> ### ⚠️ MOS e hapni me dopio-klik!
> `file:///C:/...` **nuk funksionon**. Modulet ES (`import` / `export`) bllokohen
> nga politika CORS, dhe Geolocation/Notifications kërkojnë `localhost` ose `https`.
> Nëse shihni një shirit të kuq lart — pikërisht kjo ka ndodhur.

**Nuk kini internet?** Aplikacioni punon. Vetëm grafikët (CDN i Chart.js),
importi nga API dhe citati i ditës kalojnë në rezervë. Kjo është e qëllimshme —
shih `js/services/api.js`.

---

## 🗺️ Çfarë ka brenda

| Tab | Çka shihni | Temat e syllabus-it |
|---|---|---|
| **Paneli** | Statistika, dy grafikë Chart.js, ndarje sipas kursit | Java 2, 11 |
| **Studentët** | Formular me validim, kërkim/filtrim/renditje, CRUD, import/eksport JSON | Java 3, 9, 10 |
| **Laboratori** | 4 eksperimente: Event Loop, Callback→Promise→async, Web APIs, Storage | Java 5–8, 10 |
| **Harta e mësimit** | Syllabus-i → skedarët përkatës, brenda aplikacionit | Java 4 |

### Funksionet
- ✅ Shto / ndrysho / fshij studentë (me **Kthe** — undo)
- ✅ Validim live me **regex** që pranon shkronjat shqipe (`ë`, `ç`)
- ✅ Kërkim me **debounce**, filtrim sipas kursit & statusit, 6 mënyra renditjeje
- ✅ Statistika: mesatare, mediana, kalueshmëri, më i mirë, ndarje sipas kursit
- ✅ Dy grafikë Chart.js që ndjekin temën e errët/ndritshme
- ✅ Import 5 studentësh të vërtetë nga **randomuser.me** (Fetch)
- ✅ Shkarko / lexo **JSON** (Blob + FileReader)
- ✅ Tema e errët/ndritshme/sistem, e ruajtur
- ✅ Shkurtesa tastiere: `/` `T` `1–4` `Ctrl+Z`
- ✅ Toaste, dialog nativ `<dialog>`, gjendje boshe, `aria-*`

---

## 🏛️ Arkitektura

Rregulli i vetëm që mban gjithçka bashkë: **varësitë shkojnë vetëm nga poshtë-lart.**
`core/` nuk e njeh `ui/`. `ui/` nuk vendos. Vetëm `app/` vendos.

```
                    ┌──────────────┐
   klikim  ────────►│  app/actions │  VENDOS: çka ndodh kur…
                    └──────┬───────┘
                           │ setState()
                    ┌──────▼───────┐
                    │  core/store  │  E VËRTETA E VETME (single source of truth)
                    └──────┬───────┘
                           │ njofton abonentët
                    ┌──────▼───────┐
                    │  app/render  │  një funksion vizaton TË GJITHË ekranin
                    └──────┬───────┘
             ┌─────────────┼──────────────┐
        ┌────▼───┐   ┌─────▼────┐   ┌─────▼─────┐
        │  ui/*  │   │ charts/* │   │  core/*   │
        │ vizato │   │ Chart.js │   │ llogarit  │
        └────────┘   └──────────┘   └───────────┘
                           ▲
                    ┌──────┴───────┐
                    │  services/*  │  bota e jashtme: rrjet, storage, shfletues
                    └──────────────┘
```

### Pemë e skedarëve

```
7scantech-student-manager-pro/
│
├── index.html              ← e vetmja faqe; përmban <template> dhe <dialog>
├── README.md               ← ky skedar
├── EXERCISES.md            ← 12 javë detyrash + 3 projekte finale + rubrika
├── CHEATSHEET.md           ← referencë e shpejtë ES6+/async/DOM (shqip)
│
├── assets/
│   └── icon.svg
│
├── css/                    ← 4 skedarë, të ndarë sipas përgjegjësisë
│   ├── tokens.css           · ngjyrat & hapësirat (design tokens + tema)
│   ├── base.css             · reset + elementë bazë
│   ├── layout.css           · grid, topbar, tabs
│   └── components.css       · karta, butona, toast, modal, log…
│
└── js/
    ├── main.js             ← PIKA E HYRJES. Vetëm bootstrap, zero logjikë.
    ├── config.js           ← çdo konstante e projektit
    │
    ├── data/               ← të dhëna statike (pa logjikë)
    │   ├── seed.js          · 8 studentë shembull + citate rezervë
    │   └── lessons.js       · syllabus-i si të dhëna
    │
    ├── models/             ← Java 3: klasa
    │   ├── Person.js        · klasa bazë, #id privat, toJSON()
    │   ├── Student.js       · extends Person, getters, factory statike
    │   └── index.js         · barrel (re-export)
    │
    ├── core/               ← Java 1, 2, 7: logjikë e PASTËR, zero DOM
    │   ├── utils.js         · arrow, rest/spread, debounce, groupBy…
    │   ├── errors.js        · AppError → Validation/Api/StorageError
    │   ├── validation.js    · regex + rregulla për fushë
    │   ├── statistics.js    · map / filter / reduce / sort
    │   ├── selectors.js     · të dhëna të derivuara (filtro → rendit)
    │   └── store.js         · observer pattern në 50 rreshta
    │
    ├── services/           ← Java 5, 6, 7, 10: bota e jashtme
    │   ├── storage.js       · localStorage + sessionStorage + fallback
    │   ├── mockApi.js       · callback / Promise / async — e njëjta punë
    │   ├── api.js           · fetch me AbortController, allSettled
    │   ├── geolocation.js   · promisifikim + formula Haversine
    │   └── notifications.js · Notification API + lejet
    │
    ├── ui/                 ← Java 9: vizatimi. Nuk vendos asgjë.
    │   ├── dom.js           · $, $$, el, fromTemplate, delegate
    │   ├── toast.js  modal.js  theme.js  tabs.js  shortcuts.js
    │   ├── form.js  studentList.js  filters.js  stats.js
    │   ├── quote.js  importExport.js  lessonMap.js
    │   └── labs/            · logPanel, eventLoop, async, webApi, storage
    │
    ├── charts/
    │   └── gradeCharts.js  ← Java 11: E VETMJA që e njeh fjalën `Chart`
    │
    └── app/                ← Java 11: vendimet
        ├── actions.js       · i vetmi vend që ndryshon të dhënat
        ├── render.js        · dirigjenti + batching me requestAnimationFrame
        └── quickActions.js  · butonat e mëdhenj, fshirja me undo
```

---

## 📚 Harta e mësimit

Të njëjtën tabelë e kini **brenda aplikacionit** (tab «Harta e mësimit»),
me lidhje drejt skedarëve.

| Javë | Tema | Ku t'a shihni në kod |
|:---:|---|---|
| 1 | ES6+, template literals, destructuring | `core/utils.js`, `models/Person.js` |
| 2 | Default params, rest/spread, HOF, closures | `core/utils.js` (`debounce`, `once`), `core/statistics.js` |
| 3 | Klasa, `this`, getters, `extends`/`super`, `#private` | `models/Person.js`, `models/Student.js` |
| 4 | Module, `import`/`export`, barrel files, debug | `main.js`, `models/index.js`, `ui/labs/index.js` |
| 5 | Callbacks, Promises, `setTimeout` | `services/mockApi.js`, `ui/modal.js` |
| 6 | `async`/`await`, Fetch API | `services/api.js`, `ui/quote.js` |
| 7 | `try`/`catch`/`finally`, `throw`, JSON | `core/errors.js`, `ui/importExport.js` |
| 8 | Event loop, microtask vs macrotask, `Promise.all` | `ui/labs/eventLoopLab.js`, `ui/labs/asyncLab.js` |
| 9 | `<template>`, `cloneNode`, delegim, regex | `ui/studentList.js`, `core/validation.js`, `ui/form.js` |
| 10 | localStorage, sessionStorage, Geolocation, Notifications | `services/storage.js`, `services/geolocation.js` |
| 11 | Biblioteka të jashtme, modularizim, arkitekturë | `charts/gradeCharts.js`, `core/store.js`, `app/*` |
| 12 | Review, projekt final | `EXERCISES.md` |

---

## 🔍 Krahasim: Java 11 (zip) → ky projekt

Këtë tabelë ia trego klasës. Ajo shpjegon **pse** refaktorojmë.

| Tema | `week11_student_manager` | Ky projekt | Pse |
|---|---|---|---|
| Gjendja | `let students` globale + `updateApp()` me dorë | `core/store.js` me abonentë | Nuk mund të harrohet një përditësim |
| Modeli | objekt i thjeshtë `{id, name, age, grade}` | klasa `Student extends Person` | Getters, metoda, `instanceof` |
| Ruajtja | `JSON.parse` → objekte pa metoda | `Student.fromJSON()` i ringjall | `student.passed` punon pas refresh |
| Validimi | një mesazh, një fushë në kohë | `{ ok, errors: {fusha: mesazh} }` | Përdoruesi i shikon të gjitha njëherësh |
| Lista | `innerHTML=""` + listener për çdo buton | `<template>` + `cloneNode` + **një** listener | Më shpejt, pa rrjedhje memorie |
| Gabimet | `alert` / mesazh i vetëm | `ValidationError` / `ApiError` / `StorageError` | `catch` reagon sipas tipit |
| Grafiku | `chart.destroy()` + `new Chart()` | `chart.data = …; chart.update()` | Animacion i qetë, pa harxhim memorie |
| Async | vetëm sinkron | callback / Promise / `async` + `allSettled` | I gjithë Muaji 2 |
| CSS | një skedar 120 rreshta | 4 skedarë + design tokens | Tema e errët = 30 rreshta |
| Struktura | 5 module të rrafshëta | 27 module në 6 shtresa | Skalohet |

---

## 🧪 Provojini këto në klasë

1. **Event loop** — Laboratori → «Event Loop» → ▶ Ekzekuto.
   Pyetni klasën t'a parashikojë rendin **para** se t'a shtypni.
2. **Bllokimi** — shtypni «🥶 Blloko 1.5s» dhe provoni t'a klikoni ndërkohë.
   Ky është "single-threaded" i dukshëm.
3. **Sekuencial vs Paralel** — ~2100ms kundrejt ~700ms. E njëjta punë.
4. **Ringjallja e klasës** — hapni Console:
   ```js
   akademia.store.getState().students[0].describe()   // metodë e klasës punon
   JSON.parse(localStorage.getItem("sm.students"))[0].describe()   // TypeError!
   ```
   Kjo shpjegon pse `Student.fromJSON()` ekziston.
5. **sessionStorage vs localStorage** — shkruani në kërkim, `F5`
   (filtri kthehet), mbyllni tab-in dhe hapeni sërish (filtri **nuk** kthehet,
   studentët po).
6. **Debounce** — hiqni `debounce()` në `ui/filters.js:41`, shtoni 200 studentë
   dhe shkruani shpejt. Ndryshimi ndjehet.
7. **Console i brendshëm** — `akademia.actions.seed()`, `akademia.store.getState()`.

---

## 🛠️ Ndryshime të shpejta (pa frikë)

| Doni të… | Prekni vetëm |
|---|---|
| shtoni kurs të re | `js/config.js` → `COURSES` |
| ndryshoni notën kaluese | `js/config.js` → `GRADES.PASSING` |
| ndryshoni ngjyrat / temën | `css/tokens.css` |
| ndryshoni studentët shembull | `js/data/seed.js` |
| shtoni javë në hartën e mësimit | `js/data/lessons.js` |
| ndryshoni API-në | `js/config.js` → `API` |

---

## 🐞 Problemet e shpeshta

| Simptomë | Shkaku | Zgjidhja |
|---|---|---|
| Shirit i kuq: "Aplikacioni nuk u nis" | hapur me `file://` | Live Server |
| `CORS policy … blocked` në Console | e njëjta | Live Server |
| Grafikët mungojnë, pjesa tjetër punon | CDN i Chart.js i bllokuar | normal offline |
| «Importo nga API» dështon | offline / firewall | të dhënat lokale punojnë |
| Geolocation nuk përgjigjet | leja e refuzuar | 🔒 pranë URL-së → Reset |
| Njoftimet nuk shfaqen | leja / Windows Focus Assist | cilësimet e Windows-it |
| Të dhënat u zhdukën | `localStorage` i pastruar | eksportoni JSON si backup |

**Debug:** `F12` → Sources → `js/app/actions.js` → breakpoint në `addStudent`
→ shtoni një student. Shikoni **Call Stack** dhe **Scope**. Ky është ushtrimi i Javës 4.

---

## 📄 Licenca dhe përdorimi

Materiale mësimore për 7Scantech Academy. Studentët mund t'i kopjojnë,
modifikojnë dhe përdorin lirshëm si bazë për projektin final.

Të dhënat e studentëve në `js/data/seed.js` janë **të trilluara**.
`randomuser.me` kthen persona të gjeneruar — jo njerëz të vërtetë.
