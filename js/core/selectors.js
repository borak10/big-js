/* ============================================================================
 * core/selectors.js  —  "Selektorë": të dhëna të derivuara nga state-i
 * MËSIMI: Java 2 (filter / sort në zinxhir) + Java 11 (arkitekturë)
 *
 * IDEJA E MADHE:
 *   Në state-in tonë ruajmë vetëm TË VËRTETËN: lista e plotë e studentëve
 *   dhe filtrat aktualë. NUK ruajmë "listën e filtruar" — atë e llogaritim
 *   sa herë vizatojmë. Kështu nuk mund të "dalin nga sinkronizimi".
 * ==========================================================================*/

import { Student } from "../models/index.js";
import { normalize } from "./utils.js";

/** A i përshtatet studenti tekstit të kërkimit? */
const matchesQuery = (student, query) => {
    if (!query) return true;
    const needle = normalize(query);
    // Kërkojmë në disa fusha njëherësh.
    return [student.name, student.email, student.course, String(student.grade)]
        .map(normalize)
        .some((field) => field.includes(needle));
};

const matchesCourse = (student, course) => course === "all" || student.course === course;

const matchesStatus = (student, status) => {
    if (status === "passing") return student.passed;
    if (status === "failing") return !student.passed;
    return true; // "all"
};

/**
 * Zinxhiri: filtro → filtro → filtro → rendit.
 * Secili hap kthen varg të RI (immutability), origjinali nuk preket.
 */
export const selectVisibleStudents = (state) => {
    const { students, query = "", course = "all", status = "all", sort } = state;

    return students
        .filter((student) => matchesQuery(student, query))
        .filter((student) => matchesCourse(student, course))
        .filter((student) => matchesStatus(student, status))
        .sort(Student.comparator(sort));
    // ⚠️ `.sort()` mutojnë vargun — por është i sigurt sepse `.filter()`
    //    para tij krijoi një varg të re. Kjo është një kurth klasik!
};

/** A ka filtër aktiv? Përdoret për të shfaqur butonin "Hiq filtrat". */
export const hasActiveFilters = (state) =>
    Boolean(state.query) || state.course !== "all" || state.status !== "all";

/** Lista e kurseve që përdoren vërtet (për dropdown-in e filtrit). */
export const selectUsedCourses = (state) =>
    [...new Set(state.students.map((student) => student.course))].sort((a, b) =>
        a.localeCompare(b, "sq")
    );
