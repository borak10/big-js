/* ============================================================================
 * data/lessons.js  —  Syllabus-i i JavaScript Advanced → skedarët e projektit
 * MËSIMI: Java 4 — të dhëna të strukturuara, jo HTML i shkruar me dorë
 *
 * Kjo listë vizatohet nga `ui/lessonMap.js`. Shtoni një javë këtu dhe ajo
 * shfaqet vetë në aplikacion — asnjë prekje e HTML-së.
 * ==========================================================================*/

export const LESSONS = [
    {
        month: 1,
        week: 1,
        title: "ES6+ dhe template literals",
        topics: ["let / const", "arrow functions", "template literals", "destructuring"],
        files: ["js/core/utils.js", "js/config.js", "js/models/Person.js"],
        look: "Çdo funksion në utils.js është arrow function. `titleCase` përdor destructuring dhe template literals.",
    },
    {
        month: 1,
        week: 2,
        title: "Funksione të avancuara",
        topics: ["default params", "rest / spread", "higher-order functions", "closures"],
        files: ["js/core/utils.js", "js/core/statistics.js", "js/core/store.js"],
        look: "`sum(...numbers)` është rest. `debounce()` dhe `once()` janë HOF me closure. statistics.js është map/filter/reduce i pastër.",
    },
    {
        month: 1,
        week: 3,
        title: "Objekte, `this` dhe klasa",
        topics: ["klasa", "konstruktorë", "getters", "extends / super", "metoda statike", "#private"],
        files: ["js/models/Person.js", "js/models/Student.js"],
        look: "`Student extends Person`, `super.describe()`, getter-i `passed`, fusha private `#id` dhe factory `Student.fromApiUser()`.",
    },
    {
        month: 1,
        week: 4,
        title: "Module dhe debug",
        topics: ["import / export", "barrel files", "breakpoints", "console i avancuar"],
        files: ["js/main.js", "js/models/index.js", "js/ui/labs/index.js"],
        look: "26 skedarë, një `<script type=\"module\">`. Vendos breakpoint në `actions.addStudent` dhe shiko Call Stack.",
    },
    {
        month: 2,
        week: 5,
        title: "Callbacks dhe Promises",
        topics: ["callback(error, data)", "new Promise", "resolve / reject", "setTimeout"],
        files: ["js/services/mockApi.js", "js/ui/modal.js", "js/ui/importExport.js"],
        look: "mockApi.js e njëjtën punë e bën në tre stile. modal.js kthen Promise për një dialog — Promise-at nuk janë vetëm për rrjet!",
    },
    {
        month: 2,
        week: 6,
        title: "async / await dhe Fetch",
        topics: ["async / await", "fetch()", "response.ok", "AbortController"],
        files: ["js/services/api.js", "js/ui/quote.js"],
        look: "`request()` në api.js: timeout me AbortController, kontrolli i `response.ok`, `finally` për pastrim.",
    },
    {
        month: 2,
        week: 7,
        title: "Error handling dhe JSON",
        topics: ["try / catch / finally", "throw", "klasa gabimesh", "JSON.parse / stringify"],
        files: ["js/core/errors.js", "js/services/storage.js", "js/ui/importExport.js"],
        look: "`ValidationError`, `ApiError`, `StorageError` — `instanceof` vendos si reagon UI-ja. Importi i JSON-it ka dy nivele catch.",
    },
    {
        month: 2,
        week: 8,
        title: "Event loop dhe konkurrenca",
        topics: ["call stack", "microtasks", "macrotasks", "Promise.all / allSettled"],
        files: ["js/ui/labs/eventLoopLab.js", "js/ui/labs/asyncLab.js", "js/services/api.js"],
        look: "Hap tab-in «Laboratori» → «Event Loop» dhe shtyp ▶. Pastaj «Sekuencial vs Paralel».",
    },
    {
        month: 3,
        week: 9,
        title: "DOM i avancuar dhe formularë",
        topics: ["<template>", "cloneNode", "DocumentFragment", "delegim eventesh", "regex"],
        files: ["js/ui/studentList.js", "js/ui/dom.js", "js/core/validation.js", "js/ui/form.js"],
        look: "`fromTemplate()` + `fillSlots()` + një listener i vetëm me `delegate()`. Regex-at jetojnë në `PATTERNS`.",
    },
    {
        month: 3,
        week: 10,
        title: "Storage dhe Web APIs",
        topics: ["localStorage", "sessionStorage", "Geolocation", "Notifications", "Blob / FileReader"],
        files: ["js/services/storage.js", "js/services/geolocation.js", "js/services/notifications.js"],
        look: "Të dhënat → localStorage. Filtrat → sessionStorage. Laboratori → Geolocation & Notifications.",
    },
    {
        month: 3,
        week: 11,
        title: "Biblioteka dhe modularizim",
        topics: ["Chart.js", "arkitekturë me shtresa", "dependency injection", "observer pattern"],
        files: ["js/charts/gradeCharts.js", "js/core/store.js", "js/app/actions.js", "js/app/render.js"],
        look: "core → services → ui → app. `createStore()` është Redux-i në 50 rreshta. Grafikët izolohen në një modul të vetëm.",
    },
    {
        month: 3,
        week: 12,
        title: "Përsëritje dhe projekt final",
        topics: ["review", "quiz 3", "projekt final", "prezantim"],
        files: ["EXERCISES.md", "CHEATSHEET.md", "README.md"],
        look: "Tri brief-e projektesh finale dhe rubrika e vlerësimit janë në EXERCISES.md.",
    },
];
