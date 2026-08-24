/* ============================================================================
 * core/store.js  —  Një "store" i vogël (state management)
 * MËSIMI: Java 2 (closures, HOF) + Java 11 (si punojnë React/Vue nën kapak)
 *
 * PROBLEMI që zgjidh: në projektin e Javës 11 kishim `let students = [...]`
 * si variabël globale, dhe pas çdo ndryshimi thirrnim `updateApp()` me dorë.
 * Nëse harrojmë një thirrje → ekrani gënjen.
 *
 * ZGJIDHJA (modeli Observer / pub-sub):
 *   1. State-i jeton i mbyllur brenda një closure — jashtë nuk arrin njeri.
 *   2. Ndryshohet VETËM me `setState()`.
 *   3. `setState()` njofton automatikisht të gjithë abonentët.
 *
 * Kjo është, në thelb, ideja pas Redux / Zustand / Pinia.
 * ==========================================================================*/

export function createStore(initialState = {}) {
  /* `state` dhe `listeners` janë variabla private falë closure-it. */
  let state = { ...initialState };
  const listeners = new Set();

  /** Kthen një kopje TË NGRIRË — jashtë nuk mund t'a mutojë state-in. */
  const getState = () => Object.freeze({ ...state });

  /**
   * Pranon ose një objekt `{ query: "abc" }`,
   * ose një funksion `(prev) => ({ students: [...prev.students, s] })`.
   * Varianti me funksion është i sigurt kur vlera e re varet nga e vjetra.
   */
  const setState = (patch) => {
    const changes = typeof patch === "function" ? patch(state) : patch;
    const next = { ...state, ...changes };

    // Optimizim i vogël: nëse asgjë nuk ndryshoi, nuk vizatojmë kot.
    const changed = Object.keys(changes).some((key) => next[key] !== state[key]);
    state = next;
    if (changed) notify();
    return getState();
  };

  /**
   * Regjistron një funksion që thirret pas çdo ndryshimi.
   * KTHEN një funksion "unsubscribe" — closure brenda closure-it.
   */
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const notify = () => {
    const snapshot = getState();
    // Kopjojmë Set-in: nëse një listener bën unsubscribe gjatë njoftimit,
    // iterimi nuk thyhet.
    for (const listener of [...listeners]) {
      try {
        listener(snapshot);
      } catch (error) {
        // Një listener i thyer NUK duhet t'i vrasë të tjerët.
        console.error("[store] listener dështoi:", error);
      }
    }
  };

  /** Vizato njëherë në fillim, pa pritur ndryshimin e parë. */
  const start = () => notify();

  return { getState, setState, subscribe, start };
}
