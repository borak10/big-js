/* ============================================================================
 * ui/studentList.js  —  Vizatimi i listës
 * MËSIMI: Java 9 — <template> + cloneNode + DocumentFragment + delegim
 *
 * KRAHASIM me Javën 11:
 *   PARA:  `studentList.innerHTML = ""` pastaj createElement për secilin,
 *          dhe një `addEventListener` i re për SECILIN buton fshirje.
 *   TANI:  klonojmë <template>, mbushim `data-slot`, i bashkojmë në një
 *          DocumentFragment (një prekje e DOM-it), dhe kemi NJË listener
 *          të vetëm në prind (delegim).
 * ==========================================================================*/

import { formatDate, plural } from "../core/utils.js";
import { selectVisibleStudents, hasActiveFilters } from "../core/selectors.js";
import { $, clear, fillSlots, fromTemplate, toggle, delegate } from "./dom.js";

let list, emptyState, emptyText, counter, resetFiltersButton;

export function initStudentList({ actions, onDelete }) {
    list = $("#studentList");
    emptyState = $("#emptyState");
    emptyText = $("#emptyText");
    counter = $("#visibleCount");
    resetFiltersButton = $("#resetFiltersBtn");

    /* NJË listener për të gjithë butonat, tani dhe në të ardhmen.
       Provoni: shtoni 500 studentë — numri i listener-ave mbetet 1. */
    delegate(list, "click", "[data-action]", (_event, button) => {
        const id = button.closest(".student")?.dataset.id;
        if (!id) return;

        const action = button.dataset.action;
        if (action === "edit") actions.startEdit(id);
        if (action === "delete") onDelete(id);
    });

    resetFiltersButton.addEventListener("click", () => actions.resetFilters());
}

/** Ndërton një element <li> të vetëm nga template-i. */
function buildRow(student) {
    const row = fromTemplate("studentCardTemplate");
    row.dataset.id = student.id;

    // `textContent` (brenda fillSlots) e trajton çdo input si TEKST —
    // edhe `<script>` në emër do dukej si tekst. Mbrojtje falas nga XSS.
    fillSlots(row, {
        initials: student.initials,
        name: student.name,
        grade: `${student.grade} · ${student.gradeLabel}`,
        course: student.course,
        age: student.age,
        created: formatDate(student.createdAt),
        email: student.email || "—",
    });

    // Ngjyra e "chip"-it vjen nga getter-i `gradeTone` i klasës Student.
    row.querySelector('[data-slot="grade"]').classList.add(`chip--${student.gradeTone}`);
    row.classList.toggle("student--failing", !student.passed);

    return row;
}

/**
 * Vizaton listën sipas gjendjes.
 * Thirret nga app/render.js pas ÇDO ndryshimi të state-it.
 */
export function renderStudentList(state) {
    const visible = selectVisibleStudents(state);
    const total = state.students.length;

    counter.textContent =
        visible.length === total
            ? plural(total, "student", "studentë")
            : `${visible.length} / ${total}`;

    toggle(resetFiltersButton, hasActiveFilters(state));

    clear(list);

    if (visible.length === 0) {
        toggle(emptyState, true);
        emptyText.textContent =
            total === 0
                ? "Shtoni një student ose shtypni «Mbush me shembuj»."
                : "Asnjë student nuk i përgjigjet filtrave. Provoni t'i hiqni.";
        return;
    }

    toggle(emptyState, false);

    /* DocumentFragment = "qese" jashtë ekranit.
       E mbushim me 100 rreshta dhe e ngjisim NJË herë → një reflow, jo 100.
       Kjo është ndryshimi mes një liste të rrjedhshme dhe një liste që "kërcen". */
    const fragment = document.createDocumentFragment();
    for (const student of visible) fragment.append(buildRow(student));

    // Nëse ka një student në editim, e shënojmë vizualisht.
    list.append(fragment);

    if (state.editingId) {
        list.querySelector(`.student[data-id="${state.editingId}"]`)?.classList.add("student--editing");
    }
}
