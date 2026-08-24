/* ============================================================================
 * app/render.js  —  Dirigjenti i vizatimit
 * MËSIMI: Java 8 (requestAnimationFrame & batching) + Java 11 (arkitekturë)
 *
 * NJË funksion `render(state)` e vizaton TË GJITHË ekranin nga state-i.
 * Nuk ekziston "përditësoje vetëm këtë rresht" — dhe pikërisht kjo e vret
 * kategorinë e bug-eve "ekrani nuk përputhet me të dhënat".
 *
 * BATCHING: nëse një veprim bën tre `setState` njëri pas tjetrit, do të
 * merrnim tre vizatime. Me `requestAnimationFrame` i bashkojmë në një të
 * vetëm, të sinkronizuar me rifreskimin e ekranit (~60 herë/sekondë).
 * ==========================================================================*/

import { renderCharts } from "../charts/gradeCharts.js";
import { saveStudents } from "../services/storage.js";
import { StorageError } from "../core/errors.js";
import { renderFilters } from "../ui/filters.js";
import { renderStats } from "../ui/stats.js";
import { renderStudentList } from "../ui/studentList.js";
import { renderStorageLab } from "../ui/labs/index.js";
import { toastError } from "../ui/toast.js";

export function connectRenderer(store) {
  /* Ruajmë REFERENCËN e vargut të mëparshëm. Nëse është e njëjta
     referencë, studentët nuk kanë ndryshuar → nuk shkruajmë në storage.
     (Kjo punon vetëm sepse actions.js krijon gjithmonë varg TË RE.) */
  let lastStudents = null;
  let frameQueued = false;

  const paint = (state) => {
    /* RENDI KA RËNDËSI: ruajmë PARA se të vizatojmë.
     *
     * Pse? Nëse një vizatues hedh gabim, funksioni ndërpritet dhe rreshtat
     * pas tij nuk ekzekutohen. Nëse ruajtja qëndronte në fund, një gabim i
     * vogël në statistika do t'i humbte të dhënat e përdoruesit pa zë —
     * lista dukej e saktë, por rifreskimi e zbrazte. (Ky bug ndodhi vërtet
     * gjatë ndërtimit të këtij projekti: shih `ui/stats.js`.)
     *
     * Rregulli: të dhënat e përdoruesit vijnë para pikselave. */
    if (state.students !== lastStudents) {
      lastStudents = state.students;
      persist(state.students);
    }

    renderFilters(state);
    renderStudentList(state);
    renderStats(state);
    renderCharts(state);
    renderStorageLab();
  };

  const persist = (students) => {
    try {
      saveStudents(students);
    } catch (error) {
      // Kuota e mbushur ose dritare private — informojmë, nuk rrëzojmë.
      if (error instanceof StorageError) {
        toastError("Nuk mund t'i ruaj të dhënat. Ndoshta memoria është e mbushur.");
      }
      console.error("[render] ruajtja dështoi:", error);
    }
  };

  store.subscribe(() => {
    if (frameQueued) return; // vizatimi është planifikuar tashmë
    frameQueued = true;

    requestAnimationFrame(() => {
      frameQueued = false;
      // Marrim state-in E FRESKËT — jo atë të momentit kur planifikuam.
      paint(store.getState());
    });
  });

  return { paint: () => paint(store.getState()) };
}
