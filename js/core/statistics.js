/* ============================================================================
 * core/statistics.js  —  Llogaritjet
 * MËSIMI: Java 2 — HIGHER-ORDER FUNCTIONS: map, filter, reduce, sort, every
 *
 * Vini re: as edhe një `for` cikli klasik. Çdo funksion është i pastër —
 * merr një varg studentësh, kthen një numër/objekt. Zero DOM.
 * ==========================================================================*/

import { GRADES } from "../config.js";
import { groupBy, percent, round } from "./utils.js";

/** reduce = "palos" vargun në një vlerë të vetme. */
export const averageGrade = (students) => {
    if (students.length === 0) return 0;
    const total = students.reduce((acc, student) => acc + student.grade, 0);
    return round(total / students.length, 2);
};

/** Mediana: vlera e mesit pasi i rendisim notat. */
export const medianGrade = (students) => {
    if (students.length === 0) return 0;
    const grades = students.map((s) => s.grade).sort((a, b) => a - b);
    const middle = Math.floor(grades.length / 2);
    return grades.length % 2 === 0
        ? round((grades[middle - 1] + grades[middle]) / 2, 2)
        : grades[middle];
};

/** { 1: 0, 2: 3, 3: 5, 4: 2, 5: 1 } — sa studentë për secilën notë. */
export const gradeDistribution = (students) => {
    // Fillojmë me të gjitha notat në 0, që grafiku të ketë gjithmonë 5 shtylla.
    const empty = Object.fromEntries(
        Array.from({ length: GRADES.MAX - GRADES.MIN + 1 }, (_, i) => [GRADES.MIN + i, 0])
    );
    return students.reduce((dist, student) => {
        dist[student.grade] = (dist[student.grade] ?? 0) + 1;
        return dist;
    }, empty);
};

export const passingStudents = (students) => students.filter((s) => s.passed);

export const passRate = (students) =>
    percent(passingStudents(students).length, students.length);

/** Studenti me notën më të lartë. reduce me krahasim. */
export const topStudent = (students) =>
    students.length === 0
        ? null
        : students.reduce((best, student) => (student.grade > best.grade ? student : best));

export const averageAge = (students) =>
    students.length === 0
        ? 0
        : round(students.reduce((acc, s) => acc + s.age, 0) / students.length, 1);

/**
 * Statistika për secilin kurs.
 * groupBy → Object.entries → map → sortim. Zinxhir tipik funksional.
 */
export const statsByCourse = (students) => {
    const groups = groupBy(students, (student) => student.course);
    return Object.entries(groups)
        .map(([course, list]) => ({
            course,
            count: list.length,
            average: averageGrade(list),
            passRate: passRate(list),
        }))
        .sort((a, b) => b.count - a.count);
};

/** `every` → true vetëm nëse TË GJITHË kalojnë. Shkurtore e leximit. */
export const allPassed = (students) =>
    students.length > 0 && students.every((student) => student.passed);

/**
 * Një objekt i vetëm me çdo gjë që i duhet panelit.
 * UI-ja thërret VETËM këtë → më pak varësi.
 */
export const buildSummary = (students) => ({
    total: students.length,
    average: averageGrade(students),
    median: medianGrade(students),
    averageAge: averageAge(students),
    passRate: passRate(students),
    passing: passingStudents(students).length,
    top: topStudent(students),
    distribution: gradeDistribution(students),
    courses: statsByCourse(students),
    allPassed: allPassed(students),
});
