/* ============================================================================
 * ui/form.js  —  Formulari i studentit
 * MËSIMI: Java 9 — formularë, FormData, validim live, gabime për fushë
 *
 * TRE PËRMIRËSIME ndaj versionit të Javës 11:
 *   1. FormData → i lexon të gjitha fushat me një rresht, pa 5 `querySelector`.
 *   2. Validim gjatë shkrimit (blur + input), jo vetëm në submit.
 *   3. I njëjti formular shërben për SHTO dhe NDRYSHO (shih `editingId`).
 * ==========================================================================*/

import { COURSES, GRADES, GRADE_LABELS } from "../config.js";
import { ValidationError, describeError } from "../core/errors.js";
import { validateField } from "../core/validation.js";
import { range } from "../core/utils.js";
import { $, $$, fillSelect, toggle } from "./dom.js";
import { toastError, toastSuccess } from "./toast.js";

let form, submitButton, formTitle, cancelButton, editingIdInput;
let lastEditingId = null;

/** Lexon formularin → objekt i thjeshtë. FormData punon me `name=` atributet. */
function readForm() {
    const data = new FormData(form);
    // Object.fromEntries: FormData → { name: "...", age: "21", ... }
    return Object.fromEntries(data.entries());
}

/** Shfaq (ose fshij) mesazhin e gabimit nën një fushë. */
function showFieldError(field, message) {
    const node = $(`[data-error="${field}"]`);
    const input = $(`#${field}`);
    if (node) node.textContent = message ?? "";
    if (input) {
        input.classList.toggle("invalid", Boolean(message));
        // `aria-invalid` e njofton lexuesin e ekranit — aksesueshmëri, jo dekor.
        input.setAttribute("aria-invalid", String(Boolean(message)));
    }
}

function clearErrors() {
    for (const node of $$("[data-error]")) node.textContent = "";
    for (const input of $$("#studentForm .invalid")) {
        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");
    }
}

export function resetForm() {
    form.reset();
    clearErrors();
    editingIdInput.value = "";
    $("#course").value = COURSES[0];
}

export function initForm({ store, actions }) {
    form = $("#studentForm");
    submitButton = $("#submitBtn");
    formTitle = $("#formTitle");
    cancelButton = $("#cancelEditBtn");
    editingIdInput = $("#editingId");

    /* Mbushim <select>-at nga CONFIG — jo me dorë në HTML.
       Shto një kurs në config.js dhe ai shfaqet vetë kudo. */
    fillSelect(
        $("#grade"),
        [
            { value: "", label: "Zgjedh…" },
            ...range(GRADES.MIN, GRADES.MAX)
                .reverse()
                .map((grade) => ({ value: grade, label: `${grade} — ${GRADE_LABELS[grade]}` })),
        ],
        ""
    );
    fillSelect($("#course"), COURSES, COURSES[0]);

    /* ------------------------------------------------------------- submit --- */
    form.addEventListener("submit", (event) => {
        event.preventDefault(); // pa këtë, faqja rifreskohet dhe humbet gjithçka
        clearErrors();

        try {
            /* Lexojmë `wasEditing` PARA thirrjes së actions.
               Pse: `saveStudent` → `setState` → store njofton SINKRONISHT →
               abonenti më poshtë e pastron `editingIdInput`. Nëse e lexonim pas,
               do të merrnim gjithmonë "" dhe toasti do gënjente. */
            const wasEditing = Boolean(editingIdInput.value);

            const student = actions.saveStudent(readForm());
            resetForm();
            toastSuccess(
                wasEditing ? `${student.name} u përditësua.` : `${student.name} u shtua.`
            );
            $("#name").focus();
        } catch (error) {
            /* MËSIMI: Java 7 — `instanceof` vendos SI reagojmë.
               ValidationError → shënojmë fushat. Çdo gabim tjetër → toast. */
            if (error instanceof ValidationError) {
                for (const [field, message] of Object.entries(error.fields)) {
                    showFieldError(field, message);
                }
                const firstField = Object.keys(error.fields)[0];
                $(`#${firstField}`)?.focus();
                toastError("Kontrolloni fushat e shënuara.");
            } else {
                toastError(describeError(error));
                console.error(error);
            }
        }
    });

    form.addEventListener("reset", () => {
        // `reset` ndodh PARA se vlerat të pastrohen → prandaj `setTimeout(…, 0)`.
        setTimeout(() => {
            clearErrors();
            actions.cancelEdit();
            $("#course").value = COURSES[0];
        }, 0);
    });

    /* --------------------------------------------------- validim live --- */
    // `blur` = kur përdoruesi largohet nga fusha. Momenti i duhur për t'a korrigjuar.
    for (const field of ["name", "age", "grade", "email", "course"]) {
        const input = $(`#${field}`);
        if (!input) continue;

        input.addEventListener("blur", () => {
            if (input.value === "" && field === "email") return showFieldError(field, null);
            showFieldError(field, validateField(field, input.value));
        });

        // Sapo fusha bëhet e saktë, hiqi gabimin — mos e ndëshko përdoruesin.
        input.addEventListener("input", () => {
            if (input.classList.contains("invalid") && !validateField(field, input.value)) {
                showFieldError(field, null);
            }
        });
    }

    cancelButton.addEventListener("click", () => {
        actions.cancelEdit();
        resetForm();
    });

    /* ------------------------------- reagim ndaj gjendjes (editingId) --- */
    store.subscribe((state) => {
        if (state.editingId === lastEditingId) return; // asgjë për të bërë
        lastEditingId = state.editingId;

        const student = state.students.find((item) => item.id === state.editingId);

        if (!student) {
            formTitle.textContent = "Shto student";
            submitButton.textContent = "Ruaj studentin";
            toggle(cancelButton, false);
            editingIdInput.value = "";
            return;
        }

        // Mbushim formularin me të dhënat e studentit.
        formTitle.textContent = `Ndrysho: ${student.name}`;
        submitButton.textContent = "Përditëso";
        toggle(cancelButton, true);
        editingIdInput.value = student.id;

        $("#name").value = student.name;
        $("#age").value = student.age;
        $("#grade").value = String(student.grade);
        $("#course").value = student.course;
        $("#email").value = student.email;

        clearErrors();
        form.scrollIntoView({ behavior: "smooth", block: "nearest" });
        $("#name").focus();
    });
}
