/* ============================================================================
 * models/index.js  —  "Barrel file"
 * MËSIMI: Java 4 — module: re-export
 *
 * Në vend të dy rreshtave import:
 *     import { Person }  from "./models/Person.js";
 *     import { Student } from "./models/Student.js";
 * shkruajmë vetëm një:
 *     import { Person, Student } from "./models/index.js";
 *
 * Bonus: nesër mund t'i zhvendosim skedarët brenda `models/` dhe pjesa
 * tjetër e aplikacionit nuk e vë re — kjo është "enkapsulim i modulit".
 * ==========================================================================*/

export { Person } from "./Person.js";
export { Student } from "./Student.js";
