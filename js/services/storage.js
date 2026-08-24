/* ============================================================================
 * services/storage.js  —  localStorage & sessionStorage
 * MËSIMI: Java 10 — Storage APIs; Java 7 — JSON + try/catch
 *
 * DIFERENCA që duhet dinë studentët:
 *   localStorage    → qëndron edhe pasi mbyllet shfletuesi (të dhënat).
 *   sessionStorage  → fshihet kur mbyllet tab-i (gjendja e UI-së: tab aktiv,
 *                     filtrat, teksti i kërkimit).
 *
 * PSE try/catch? localStorage HEDH gabim kur:
 *   • jemi në dritare private (Safari),
 *   • kuota (~5MB) është mbushur,
 *   • përdoruesi i ka bllokuar cookies/storage.
 * Aplikacioni NUK duhet të vdesë për këtë → kalojmë në memorie.
 * ==========================================================================*/

import { STORAGE_KEYS } from "../config.js";
import { StorageError } from "../core/errors.js";
import { Student } from "../models/index.js";

/** Rezervë kur storage-i i vërtetë nuk punon. Humbet pas refresh — por punon. */
const memory = new Map();

/**
 * Fabrikë adaptorësh. Një funksion → dy objekte (`local` dhe `session`).
 * MËSIMI: Java 2 — funksion që kthen objekt me metoda (factory pattern).
 */
function createStorage(kind) {
    const available = (() => {
        try {
            const store = window[kind];
            const probe = "__test__";
            store.setItem(probe, "1");
            store.removeItem(probe);
            return true;
        } catch {
            console.warn(`[storage] ${kind} nuk është i disponueshëm — po përdor memorien.`);
            return false;
        }
    })();

    const raw = {
        get: (key) => (available ? window[kind].getItem(key) : memory.get(`${kind}:${key}`) ?? null),
        set: (key, value) =>
            available ? window[kind].setItem(key, value) : memory.set(`${kind}:${key}`, value),
        remove: (key) =>
            available ? window[kind].removeItem(key) : memory.delete(`${kind}:${key}`),
    };

    return {
        available,

        /** Lexon dhe e kthen JSON-in në objekt. Nëse teksti është i korruptuar → fallback. */
        read(key, fallback = null) {
            try {
                const text = raw.get(key);
                if (text === null) return fallback;
                return JSON.parse(text);
            } catch (error) {
                console.warn(`[storage] "${key}" ishte i korruptuar, po e fshij.`, error);
                raw.remove(key);
                return fallback;
            }
        },

        /** Shkruan objektin si JSON. JSON.stringify thërret toJSON() automatikisht. */
        write(key, value) {
            try {
                raw.set(key, JSON.stringify(value));
                return true;
            } catch (error) {
                throw new StorageError(`Nuk mund t'a ruaj "${key}".`, { cause: error });
            }
        },

        remove: raw.remove,
    };
}

export const local = createStorage("localStorage");
export const session = createStorage("sessionStorage");

/* ------------------------------------------------------------- studentët --- */

export function saveStudents(students) {
    // students → varg objektesh të thjeshta (falë toJSON në klasë)
    local.write(STORAGE_KEYS.students, students);
}

/**
 * Lexon studentët DHE i "ringjall" si instanca të klasës Student.
 * Pa `map(Student.fromJSON)` do të merrnim objekte pa metoda —
 * `student.passed` do të kthente `undefined`. Kjo është gabimi #1 i studentëve!
 */
export function loadStudents() {
    const raw = local.read(STORAGE_KEYS.students, []);
    if (!Array.isArray(raw)) return [];

    return raw
        .map((item) => {
            try {
                return Student.fromJSON(item);
            } catch (error) {
                console.warn("[storage] po e anashkaloj një rekord të pavlefshëm:", item, error);
                return null;
            }
        })
        .filter(Boolean); // heq null-at
}

export function clearStudents() {
    local.remove(STORAGE_KEYS.students);
}

/* ------------------------------------- gjendja e UI-së (sessionStorage) --- */

export const saveFilters = (filters) => session.write(STORAGE_KEYS.filters, filters);

export const loadFilters = () =>
    session.read(STORAGE_KEYS.filters, { query: "", course: "all", status: "all", sort: "created-desc" });

export const saveActiveTab = (tab) => session.write(STORAGE_KEYS.activeTab, tab);
export const loadActiveTab = () => session.read(STORAGE_KEYS.activeTab, "panel");

export const saveTheme = (theme) => local.write(STORAGE_KEYS.theme, theme);
export const loadTheme = () => local.read(STORAGE_KEYS.theme, "system");

/** Sa hapësirë po zë projekti? Përdoret nga Storage Lab. */
export function storageReport() {
    const entries = Object.entries(STORAGE_KEYS).map(([label, key]) => {
        const store = key.includes("activeTab") || key.includes("filters") ? session : local;
        const text = store.read(key, null);
        const size = text === null ? 0 : JSON.stringify(text).length;
        return { label, key, size, empty: size === 0 };
    });

    return {
        entries,
        totalBytes: entries.reduce((sum, entry) => sum + entry.size, 0),
        localAvailable: local.available,
        sessionAvailable: session.available,
    };
}
