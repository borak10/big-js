/* ============================================================================
 * app/actions.js  —  I VETMI vend që ndryshon të dhënat
 * MËSIMI: Java 11 — refaktorim i një projekti të madh në module
 *
 * REGULLI I ARKITEKTURËS:
 *   • `core/`     → llogarit, nuk ndryshon asgjë (funksione të pastra)
 *   • `services/` → komunikon me botën (rrjet, storage, shfletues)
 *   • `ui/`       → vizaton, nuk vendos
 *   • `app/`      → VENDOS. Këtu jeton "çka ndodh kur…"
 *
 * Asnjë funksion këtu nuk prek DOM-in. Kështu i njëjti kod do të punonte
 * edhe në një aplikacion mobil — vetëm shtresa UI do të zëvendësohej.
 * ==========================================================================*/

import { Student } from "../models/index.js";
import { assertValidStudent } from "../core/validation.js";
import { saveFilters } from "../services/storage.js";
import { SEED_STUDENTS } from "../data/seed.js";

/**
 * Fabrika e veprimeve. Marrim `store` si argument (dependency injection)
 * në vend që t'a importojmë — kështu mund t'a testojmë me një store fals.
 */
export function createActions(store) {
  const { getState, setState } = store;

  /* ------------------------------------------------------------ studentët --- */

  /**
   * Shton një student të re.
   * @throws {ValidationError} nëse formulari ka gabime — thirrësi bën catch.
   */
  function addStudent(input) {
    const values = assertValidStudent(input); // hedh gabim ose kthen vlera të pastra
    const student = new Student(values);

    // Immutability: krijojmë varg TË RE me spread, nuk bëjmë `.push()`.
    setState((prev) => ({ students: [student, ...prev.students] }));
    return student;
  }

  /** Ndryshon një student ekzistues. `map` + `withChanges` → varg i re. */
  function updateStudent(id, input) {
    const values = assertValidStudent(input);

    setState((prev) => ({
      students: prev.students.map((student) =>
        student.id === id ? student.withChanges(values) : student
      ),
      editingId: null,
    }));

    return getState().students.find((student) => student.id === id) ?? null;
  }

  /** Ruaj = shto ose ndrysho, sipas gjendjes. Një funksion, dy sjellje. */
  function saveStudent(input) {
    const { editingId } = getState();
    return editingId ? updateStudent(editingId, input) : addStudent(input);
  }

  /**
   * Fshin një student, por RUAN kopjen për "Kthe" (undo).
   * Ruajmë edhe indeksin, që kthimi t'a vendosë saktësisht ku ishte.
   */
  function deleteStudent(id) {
    const { students } = getState();
    const index = students.findIndex((student) => student.id === id);
    if (index === -1) return null;

    const removed = students[index];

    setState((prev) => ({
      students: prev.students.filter((student) => student.id !== id),
      lastDeleted: { student: removed, index },
      editingId: prev.editingId === id ? null : prev.editingId,
    }));

    return removed;
  }

  /** Kthe fshirjen e fundit. `toSpliced` do ishte ideal, por `slice` punon gjithkund. */
  function undoDelete() {
    const { lastDeleted } = getState();
    if (!lastDeleted) return null;

    const { student, index } = lastDeleted;

    setState((prev) => {
      const students = [...prev.students];
      students.splice(Math.min(index, students.length), 0, student);
      return { students, lastDeleted: null };
    });

    return student;
  }

  function clearAll() {
    const count = getState().students.length;
    setState({ students: [], lastDeleted: null, editingId: null });
    return count;
  }

  /**
   * Shton shumë studentë, pa dublikime sipas emrit + kursit.
   * `Set` për kontroll O(1) — jo `array.includes()` brenda ciklit.
   */
  function addMany(newStudents = []) {
    const { students } = getState();
    const seen = new Set(students.map((s) => `${s.name}|${s.course}`.toLowerCase()));

    const unique = newStudents.filter((student) => {
      const key = `${student.name}|${student.course}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (unique.length > 0) {
      setState((prev) => ({ students: [...unique, ...prev.students] }));
    }

    return { added: unique.length, skipped: newStudents.length - unique.length };
  }

  /** Mbush me të dhënat shembull nga `data/seed.js`. */
  function seed() {
    return addMany(SEED_STUDENTS.map((raw) => new Student(raw)));
  }

  /* -------------------------------------------------------------- editimi --- */

  const startEdit = (id) => setState({ editingId: id });
  const cancelEdit = () => setState({ editingId: null });

  /* -------------------------------------------------------------- filtrat --- */

  /**
   * Ndryshon filtrat DHE i ruan në sessionStorage.
   * Vini re: një burim i vetëm i së vërtetës — UI-ja nuk ruan asgjë vetë.
   */
  function setFilters(patch) {
    const next = setState(patch);
    saveFilters({
      query: next.query,
      course: next.course,
      status: next.status,
      sort: next.sort,
    });
  }

  const resetFilters = () =>
    setFilters({ query: "", course: "all", status: "all", sort: "created-desc" });

  /* --------------------------------------------------------------- import --- */

  /**
   * Përkthen JSON të papërpunuar (nga skedar ose API) në instanca Student.
   * @throws {Error} nëse struktura nuk është varg
   */
  function importFromJson(raw) {
    const list = Array.isArray(raw) ? raw : raw?.students;
    if (!Array.isArray(list)) {
      throw new Error("Skedari duhet të përmbajë një varg studentësh.");
    }

    const students = list
      .filter((item) => item && typeof item === "object" && item.name)
      .map((item) => Student.fromJSON(item));

    if (students.length === 0) {
      throw new Error("Nuk u gjet asnjë student i vlefshëm në skedar.");
    }

    return addMany(students);
  }

  /** Të dhënat gati për shkarkim — me metadata, si një API i vërtetë. */
  function exportPayload() {
    const { students } = getState();
    return {
      exportedAt: new Date().toISOString(),
      app: "Akademia · 7Scantech",
      count: students.length,
      students, // JSON.stringify thërret toJSON() për secilin
    };
  }

  return {
    addStudent,
    updateStudent,
    saveStudent,
    deleteStudent,
    undoDelete,
    clearAll,
    addMany,
    seed,
    startEdit,
    cancelEdit,
    setFilters,
    resetFilters,
    importFromJson,
    exportPayload,
  }
};