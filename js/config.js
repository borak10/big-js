/* ============================================================================
 * config.js  —  Konfigurimi i aplikacionit
 * MËSIMI: Java 4 (Module) + Java 1 (const, objekte të grupuara)
 *
 * REGULLI: asnjë "numër magjik" dhe asnjë tekst i fiksuar në logjikë.
 * Çdo vlerë që një mësues/student mund të dojë t'a ndryshojë, jeton KËTU.
 * ==========================================================================*/

export const APP = {
  name: "Akademia",
  subtitle: "Menaxheri i studentëve — 7Scantech",
  version: "1.0.0",
  /** Sa studentë maksimum shfaqen në grafikun me shtylla (që të mos mbytet). */
  chartLimit: 12,
};

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

