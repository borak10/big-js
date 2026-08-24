/* ============================================================================
 * core/utils.js  —  Funksione ndihmëse, të pastra (pure functions)
 * MËSIMI: Java 1 (arrow, template literals) + Java 2 (default params,
 *         rest / spread, higher-order functions)
 *
 * "Funksion i pastër" = për të njëjtin input jep gjithmonë të njëjtin output
 * dhe NUK e prek botën përjashta (pa DOM, pa localStorage, pa fetch).
 * Funksionet e pastra janë më të lehta për t'u testuar dhe për t'u kuptuar.
 * ==========================================================================*/

/** Identifikues unik. `crypto.randomUUID` ekziston në localhost & https. */
export const uid = () =>
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ---------------------------------------------------------------- numra --- */

/** REST PARAMETERS (...) — pranon sa argumente të dojë. sum(1,2,3) === 6 */
export const sum = (...numbers) => numbers.reduce((total, n) => total + n, 0);

/** SPREAD (...) — e shpërndan vargun si argumente: sum(...[1,2,3]) */
export const sumOf = (array) => sum(...array);

/** E mban `value` brenda kufijve. Default params në veprim. */
export const clamp = (value, min = 0, max = 100) =>
    Math.min(Math.max(value, min), max);

/** Rrumbullakim i kontrolluar: round(3.14159, 2) === 3.14 */
export const round = (value, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

export const percent = (part, total) => (total === 0 ? 0 : round((part / total) * 100, 1));

/* ----------------------------------------------------------------- tekst --- */

export const capitalize = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** "  ardit   krasniqi " → "Ardit Krasniqi" */
export const titleCase = (text = "") =>
    text.trim().split(/\s+/).map(capitalize).join(" ");

/**
 * Fjalë në shumës, shqip. plural(1,"student","studentë") → "1 student"
 * Vini re parametrin e tretë me DEFAULT VALUE.
 */
export const plural = (count, one, many, includeCount = true) => {
    const word = count === 1 ? one : many;
    return includeCount ? `${count} ${word}` : word;
};

/** Mbron nga XSS kur ndërtojmë HTML me template literals (Java 9). */
export const escapeHtml = (text = "") =>
    String(text).replace(/[&<>"']/g, (ch) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[ch]));

/** Krahasim pa gërmanë të mëdha/vogla dhe pa theks: "Bardhë" ~ "bardhe" */
export const normalize = (text = "") =>
    text
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim();

/* ------------------------------------------------------------------ data --- */

export const formatDate = (isoString, locale = "sq-AL") => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatTime = (date = new Date()) =>
    date.toLocaleTimeString("sq-AL", { hour12: false }) +
    "." +
    String(date.getMilliseconds()).padStart(3, "0");

/* --------------------------------------------------------- asinkronizëm --- */

/**
 * Pauzë e bazuar në Promise. MËSIMI: Java 5 — kjo është "promisifikimi"
 * i `setTimeout`. Përdorim: `await sleep(500)`
 */
export const sleep = (ms = 300) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * HIGHER-ORDER FUNCTION (Java 2): merr një funksion, kthen një funksion.
 * `debounce` pret derisa përdoruesi të ndalojë së shkruari — ideal për kërkim.
 */
export const debounce = (fn, delay = 250) => {
    let timerId = null;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => fn(...args), delay);
    };
};

/** Vetëm një ekzekutim, sado herë t'a thërrasim. Closure në praktikë. */
export const once = (fn) => {
    let called = false;
    let result;
    return (...args) => {
        if (!called) {
            called = true;
            result = fn(...args);
        }
        return result;
    };
};

/* ---------------------------------------------------------------- vargje --- */

/** groupBy(students, s => s.course) → { "Frontend": [...], ... } */
export const groupBy = (items, keyFn) =>
    items.reduce((groups, item) => {
        const key = keyFn(item);
        // `??=` (logical nullish assignment) — ES2021
        groups[key] ??= [];
        groups[key].push(item);
        return groups;
    }, {});

/** Kthen një kopje të renditur — NUK prek vargun origjinal (immutability). */
export const sortBy = (items, valueFn, direction = "asc") =>
    [...items].sort((a, b) => {
        const [x, y] = [valueFn(a), valueFn(b)];
        const result = typeof x === "string" ? x.localeCompare(y, "sq") : x - y;
        return direction === "asc" ? result : -result;
    });

/** range(1, 5) → [1,2,3,4,5] */
export const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

/** Zgjedh vetëm çelësat e kërkuar nga një objekt. Spread + destructuring. */
export const pick = (object, keys = []) =>
    keys.reduce((result, key) => {
        if (key in object) result[key] = object[key];
        return result;
    }, {});
