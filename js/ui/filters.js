/* ============================================================================
 * ui/filters.js  —  Kërkimi, filtrat dhe renditja
 * MËSIMI: Java 2 (debounce = higher-order function) + Java 10 (sessionStorage)
 *
 * PROBLEMI: `input` shkrepet për SECILIN karakter. Me 500 studentë kjo
 * do të thotë 500 rivizatime ndërsa shkruani "Ardit" → ndërfaqe e ngathët.
 * ZGJIDHJA: `debounce` — presim 200ms qetësi, pastaj vizatojmë njëherë.
 * ==========================================================================*/

import { SORT_OPTIONS } from "../config.js";
import { debounce } from "../core/utils.js";
import { selectUsedCourses } from "../core/selectors.js";
import { $, fillSelect } from "./dom.js";

let searchInput, courseFilter, statusFilter, sortSelect;
let lastCourseOptions = "";

export function initFilters({ store, actions }) {
    searchInput = $("#searchInput");
    courseFilter = $("#courseFilter");
    statusFilter = $("#statusFilter");
    sortSelect = $("#sortSelect");

    fillSelect(sortSelect, SORT_OPTIONS, store.getState().sort);

    /* Vlerat fillestare vijnë nga state-i (i lexuar nga sessionStorage). */
    const state = store.getState();
    searchInput.value = state.query;
    statusFilter.value = state.status;

    // 200ms është pika e ëmbël: e pandjeshme për njeriun, kursim i madh për CPU-në.
    searchInput.addEventListener(
        "input",
        debounce((event) => actions.setFilters({ query: event.target.value }), 200)
    );

    // `change` (jo `input`) për select-at — shkrepet vetëm kur zgjedhja mbaron.
    courseFilter.addEventListener("change", (event) =>
        actions.setFilters({ course: event.target.value })
    );
    statusFilter.addEventListener("change", (event) =>
        actions.setFilters({ status: event.target.value })
    );
    sortSelect.addEventListener("change", (event) =>
        actions.setFilters({ sort: event.target.value })
    );

    // `Esc` brenda kërkimit e pastron — detaj i vogël, ndjesi profesionale.
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.stopPropagation();
            actions.setFilters({ query: "" });
        }
    });
}

/**
 * Sinkronizon kontrollet me state-in.
 * Rimbushim dropdown-in e kurseve VETËM nëse lista e kurseve ka ndryshuar —
 * përndryshe do t'i "vidhnim" fokusin përdoruesit në çdo shkronjë.
 */
export function renderFilters(state) {
    const courses = selectUsedCourses(state);

    /* KURTHI: filtroni «Backend», pastaj fshini të gjithë studentët e Backend-it.
       Kursi zhduket nga lista e opsioneve, `select.value = "Backend"` dështon
       në heshtje dhe kontrolli shfaq «Të gjithë kurset» — ndërsa state-i mban
       ende «Backend». Ekrani do gënjente.
       Zgjidhja: e mbajmë kursin e zgjedhur në listë edhe pa studentë.
       (Vizatuesi NUK ka të drejtë t'a ndryshojë state-in për t'a "rregulluar".) */
    const options = [...courses];
    if (state.course !== "all" && !options.includes(state.course)) {
        options.push(`${state.course}`);
    }

    const signature = options.join("|");

    if (signature !== lastCourseOptions) {
        lastCourseOptions = signature;
        fillSelect(
            courseFilter,
            [{ value: "all", label: "Të gjithë kurset" }, ...options],
            state.course
        );
    }

    // Mos e shkruaj mbi inputin ndërsa përdoruesi shkruan në të.
    if (document.activeElement !== searchInput && searchInput.value !== state.query) {
        searchInput.value = state.query;
    }
    if (courseFilter.value !== state.course) courseFilter.value = state.course;
    if (statusFilter.value !== state.status) statusFilter.value = state.status;
    if (sortSelect.value !== state.sort) sortSelect.value = state.sort;
}

export const focusSearch = () => {
    searchInput?.focus();
    searchInput?.select();
};
