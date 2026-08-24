/* ============================================================================
 * core/validation.js  —  Validimi i formularit
 * MËSIMI: Java 9 — validim me REGEX; Java 7 — throw / ValidationError
 *
 * Ndryshimi kryesor nga versioni i Javës 11:
 *   PARA:  kthente vetëm { valid, message }  → një gabim në një kohë.
 *   TANI:  kthen  { ok, errors: {fusha: mesazh} } → i gjithë formulari
 *          kontrollohet njëherësh dhe secili input tregon gabimin e vet.
 * ==========================================================================*/

import { AGE, COURSES, GRADES } from "../config.js";
import { ValidationError } from "./errors.js";

/**
 * REGEX-at e projektit. Të mbledhur në një vend → lehtë për t'u testuar.
 *
 *  \p{L}  = çdo shkronjë e ÇDO alfabeti (kështu "Bardhë", "Çlirim" kalojnë).
 *  /u     = flamuri Unicode, i detyrueshëm për \p{...}
 */
export const PATTERNS = {
    // Shkronjë në fillim, pastaj shkronja/hapësira/apostrof/vizë. 2–50 karaktere.
    name: /^\p{L}[\p{L}\s'’-]{1,49}$/u,
    // Email "sa duhet i strikt": tekst @ tekst . prapashtesë(2+)
    email: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
    // Vetëm numra të plotë (pa presje dhjetore).
    integer: /^\d+$/,
};

/** Rregullat për secilën fushë. Objekt → lehtë të shtohen të reja. */
const RULES = {
    name(value) {
        const text = value.trim();
        if (!text) return "Emri është i detyrueshëm.";
        // Mesazh i shkurtër me qëllim: shembulli jeton në `placeholder`, kështu
        // teksti nuk mbështjellet dhe formulari nuk zhvendoset. Shih components.css.
        if (!PATTERNS.name.test(text)) return "Vetëm shkronja, 2–50 karaktere.";
        if (!text.includes(" ")) return "Shkruani emrin dhe mbiemrin.";
        return null; // null = në rregull
    },

    /* `age` dhe `grade` ndodhen në kolonat e ngushta (.field-row), prandaj
       mesazhet e tyre janë ME QËLLIM të shkurtra — një mesazh që mbështillet
       në tri rreshta e rrit formularin dhe e zhvendos butonin «Ruaj» pikërisht
       ndërsa përdoruesi po e klikon. Teksti i gjatë nuk është vetëm i shëmtuar;
       është bug i përdorshmërisë. */
    age(value) {
        const text = String(value).trim();
        if (!text) return "E detyrueshme.";
        if (!PATTERNS.integer.test(text)) return "Vetëm numra të plotë.";
        const age = Number(text);
        if (age < AGE.MIN || age > AGE.MAX) return `Mosha: ${AGE.MIN}–${AGE.MAX}.`;
        return null;
    },

    grade(value) {
        const text = String(value).trim();
        if (!text) return "E detyrueshme.";
        const grade = Number(text);
        if (!Number.isInteger(grade)) return "Vetëm numra të plotë.";
        if (grade < GRADES.MIN || grade > GRADES.MAX)
            return `Nota: ${GRADES.MIN}–${GRADES.MAX}.`;
        return null;
    },

    /** Email-i është OPSIONAL — bosh është në rregull, i shtrembër jo. */
    email(value) {
        const text = value.trim();
        if (!text) return null;
        if (!PATTERNS.email.test(text)) return "Formati i email-it nuk është i saktë.";
        return null;
    },

    course(value) {
        if (!COURSES.includes(value)) return "Zgjedhni një kurs të vlefshëm.";
        return null;
    },
};

/** Validon një fushë të vetme — për reagim të menjëhershëm gjatë shkrimit. */
export function validateField(field, value) {
    const rule = RULES[field];
    return rule ? rule(value ?? "") : null;
}

/**
 * Validon të gjithë formularin.
 * @returns {{ ok: boolean, errors: Record<string,string>, values: object }}
 */
export function validateStudentInput(input = {}) {
    const errors = {};

    // Object.entries + for...of: iterojmë rregullat, nuk i shkruajmë me dorë.
    for (const [field, rule] of Object.entries(RULES)) {
        const message = rule(input[field] ?? "");
        if (message) errors[field] = message;
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
        // Vlerat e "pastruara" (trimmed, të konvertuara) — gati për konstruktorin.
        values: {
            name: String(input.name ?? "").trim(),
            age: Number(input.age),
            grade: Number(input.grade),
            email: String(input.email ?? "").trim(),
            course: input.course,
        },
    };
}

/**
 * Varianti që HEDH gabim (throw) në vend që t'a kthejë.
 * MËSIMI: Java 7 — kështu lidhet validimi me `try / catch`.
 */
export function assertValidStudent(input) {
    const result = validateStudentInput(input);
    if (!result.ok) {
        throw new ValidationError("Formulari ka gabime.", result.errors);
    }
    return result.values;
}
