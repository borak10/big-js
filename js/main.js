/* 
 * main.js  —  PIKA E HYRJES. E vetmja skedar që e njeh HTML-i.
 * MËSIMI: Java 4 (module) + Java 11 (arkitekturë me shtresa)
 *
 * Detyra e vetme e këtij skedari është BOOTSTRAP:
 *   1. lexo gjendjen e ruajtur     4. lidh dëgjuesat
 *   2. krijo store-in              5. vizato herën e parë
 *   3. inicializo modulet UI       6. ngarko të dhëna nga rrjeti
 *
 * ZERO logjikë biznesi. Zero `querySelector`. Nëse rritet, ka nevojë
 * për refaktorim — jo për më shumë rreshta.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  RRJEDHA E TË DHËNAVE (një drejtim, si në React)                     │
 * │                                                                      │
 * │   klikim ──► app/actions ──► store.setState ──► store notifikon      │
 * │                                                       │              │
 * │              ui/* vizaton ◄── app/render ◄────────────┘              │
 * │                                                                      │
 * │  UI-ja nuk e ndryshon KURRË state-in vetë. Vetëm actions e bëjnë.    │
 * └──────────────────────────────────────────────────────────────────────┘
 * ==========================================================================*/

import { APP } from "./config.js";

/* --- core: llogaritje të pastra, pa varësi ------------------------------- */
import { createStore } from "./core/store.js";

/* --- services: bota e jashtme (storage, rrjet, shfletues) --------------- */
import { loadFilters, loadStudents } from "./services/storage.js";

/* --- app: vendimet ------------------------------------------------------- */
import { createActions } from "./app/actions.js";
import { connectRenderer } from "./app/render.js";
import { createDeleteHandler, initQuickActions } from "./app/quickActions.js";

/* --- ui: vizatimi ------------------------------------------------------- */
import { $ } from "./ui/dom.js";
import { initToasts } from "./ui/toast.js";
import { initModal } from "./ui/modal.js";
import { initTheme } from "./ui/theme.js";
import { initTabs, onTabChange } from "./ui/tabs.js";
import { initForm } from "./ui/form.js";
import { initFilters } from "./ui/filters.js";
import { initStudentList } from "./ui/studentList.js";
import { initLabs } from "./ui/labs/index.js";
import { initImportExport } from "./ui/importExport.js";
import { initShortcuts } from "./ui/shortcuts.js";
import { renderLessonMap } from "./ui/lessonMap.js";
import { loadQuote } from "./ui/quote.js";

/* --- charts: biblioteka e jashtme, e izoluar ---------------------------- */
import { initCharts, refreshChartTheme } from "./charts/gradeCharts.js";

/* ═══════════════════════════════════════════════════════════════════════
 * 1) GJENDJA FILLESTARE
 *    Të dhënat vijnë nga localStorage, filtrat nga sessionStorage.
 *    Spread (...) i bashkon në një objekt të vetëm.
 * ═════════════════════════════════════════════════════════════════════ */
function buildInitialState() {
  return {
    students: loadStudents(), // instanca Student, të "ringjallura"
    ...loadFilters(),         // query, course, status, sort
    editingId: null,
    lastDeleted: null,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
 * 2) BOOTSTRAP
 * ═════════════════════════════════════════════════════════════════════ */
function bootstrap() {
  const store = createStore(buildInitialState());
  const actions = createActions(store);

  /* --- UI bazë: duhet të ekzistojnë para gjithçkaje tjetër --- */
  initToasts();
  initModal();

  /* --- tema: grafikët duhet t'a dinë ngjyrën e sfondit --- */
  initTheme({ onChange: () => refreshChartTheme() });

  /* --- module që lexojnë/shkruajnë state --- */
  initForm({ store, actions });
  initFilters({ store, actions });
  initStudentList({ actions, onDelete: createDeleteHandler({ actions }) });
  initQuickActions({ store, actions });
  initImportExport({ actions });
  initLabs();
  initShortcuts({ actions, onThemeChange: () => refreshChartTheme() });

  /* --- biblioteka e jashtme: mund të dështojë, dhe kjo është në rregull --- */
  initCharts();

  /* --- navigimi: harta e mësimit vizatohet vetëm kur hapet (lazy) --- */
  initTabs();
  onTabChange((tab) => {
    if (tab === "lesson") renderLessonMap();
  });
  if (window.location.hash) {
    // Lidhje të drejtpërdrejta: index.html#lab
    const target = window.location.hash.slice(1);
    if (["panel", "students", "lab", "lesson"].includes(target)) {
      import("./ui/tabs.js").then(({ showTab }) => showTab(target));
    }
  }

  /* --- lidhim vizatimin me store-in, pastaj vizatojmë herën e parë --- */
  connectRenderer(store);
  store.start();

  /* --- kozmetikë --- */
  $("#appVersion").textContent = `v${APP.version}`;
  document.title = `${APP.name} — ${APP.subtitle}`;

  /* --- të dhëna nga rrjeti: NUK e bllokojnë ndërfaqen ---
     Pa `await` këtu: aplikacioni është plotësisht i përdorshëm ndërsa
     citati po ngarkohet. Kjo është ndryshimi mes "shpejt" dhe "duket shpejt". */
  loadQuote();

  /* --- një dritare në botën e brendshme, për mësim dhe debug (Java 4) ---
     Hapni Console dhe provoni:
        akademia.store.getState()
        akademia.actions.seed()
        akademia.store.getState().students[0].describe()
     ⚠️ Në një projekt real prodhimi, KJO nuk shpërndahet. */
  globalThis.akademia = { store, actions, version: APP.version };

  console.log(
    `%c ${APP.name} v${APP.version} %c gati. Provo: akademia.store.getState() `,
    "background:#5b5bd6;color:#fff;border-radius:3px 0 0 3px;padding:2px 6px",
    "background:#eef;color:#333;border-radius:0 3px 3px 0;padding:2px 6px"
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * 3) NISJA
 *    `type="module"` nënkupton `defer`, kështu DOM-i është gati.
 *    try/catch rreth bootstrap-it: nëse diçka thyhet, përdoruesi merr
 *    mesazh të kuptueshëm në vend të një faqe të bardhë (Java 7).
 * ═════════════════════════════════════════════════════════════════════ */
try {
  bootstrap();
} catch (error) {
  console.error("[bootstrap] dështoi:", error);
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div style="background:#e5484d;color:#fff;padding:1rem 1.25rem;font:14px/1.5 system-ui">
       <strong>Aplikacioni nuk u nis.</strong> Hapni Console (F12) për detaje.<br>
       Shkaku më i shpeshtë: skedari u hap me dopio-klik. Modulet kërkojnë
       <em>Live Server</em> (http://localhost), jo <code>file://</code>.
     </div>`
  );
}



// config.js

/* ============================================================================
 * config.js  —  Konfigurimi i aplikacionit
 * MËSIMI: Java 4 (Module) + Java 1 (const, objekte të grupuara)
 *
 * REGULLI: asnjë "numër magjik" dhe asnjë tekst i fiksuar në logjikë.
 * Çdo vlerë që një mësues/student mund të dojë t'a ndryshojë, jeton KËTU.
 * ==========================================================================*/



/* Çelësat e ruajtjes. Prefiksi "sm." shmang përplasjen me projekte të tjera
 * që hapen në të njëjtin localhost (Live Server i ndan sipas portit, jo folderit!). */
export const STORAGE_KEYS = {
  students: "sm.students",
  theme: "sm.theme",
  activeTab: "sm.activeTab", // sessionStorage — harrohet kur mbyllet tab-i
  filters: "sm.filters",     // sessionStorage
};

/* Sistemi i notave në Kosovë: 1 = më e dobëta, 5 = më e mira. */
export const GRADES = {
  MIN: 1,
  MAX: 5,
  PASSING: 2, // ndrysho këtu dhe i gjithë aplikacioni e respekton
};

export const GRADE_LABELS = {
  1: "Pakënaqshëm",
  2: "Kalues",
  3: "Mirë",
  4: "Shumë mirë",
  5: "Shkëlqyeshëm",
};

export const AGE = {
  MIN: 6,
  MAX: 100,
};

export const COURSES = [
  "JavaScript Advanced",
  "Frontend",
  "Backend",
  "UI/UX Design",
  "QA & Testing",
];

export const SORT_OPTIONS = [
  { value: "created-desc", label: "Më të rejat" },
  { value: "created-asc", label: "Më të vjetrat" },
  { value: "name-asc", label: "Emri A → Z" },
  { value: "name-desc", label: "Emri Z → A" },
  { value: "grade-desc", label: "Nota (lart → poshtë)" },
  { value: "grade-asc", label: "Nota (poshtë → lart)" },
];

/* API-t publike që përdorim në Javën 6/7. Nuk kërkojnë çelës (API key). */
export const API = {
  randomUser: "https://randomuser.me/api/",
  quote: "https://dummyjson.com/quotes/random",
  /** Sa presim para se t'a ndërpresim kërkesën (AbortController). */
  timeoutMs: 8000,
};

/* Kampusi i 7Scantech në Prishtinë — përdoret nga Geolocation Lab. */
export const CAMPUS = {
  name: "Prishtinë (qendër)",
  lat: 42.6629,
  lng: 21.1655,
};

/* Sa kohë qëndron një toast në ekran (ms). */
export const TOAST_DURATION = 3200;

