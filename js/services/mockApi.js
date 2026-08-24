/* ============================================================================
 * services/mockApi.js  —  Callback vs Promise vs async/await
 * MËSIMI: Java 5 (callbacks + Promises + setTimeout) & Java 6 (async/await)
 *
 * I NJËJTI punë, tre stile. Hapeni "Laboratori" në aplikacion dhe
 * shtypni tre butonat: rezultati është identik, kodi jo.
 *
 * Ky skedar NUK përdor internet — simulojmë vonesën me setTimeout,
 * kështu mësimi funksionon edhe pa lidhje.
 * ==========================================================================*/

import { SEED_STUDENTS } from "../data/seed.js";
import { ApiError } from "../core/errors.js";
import { sleep } from "../core/utils.js";

const LATENCY_MS = 700;

/* ===========================================================================
 * 1) STILI I VJETËR: CALLBACK
 *    Konventa e Node.js: callback(error, data) — gabimi i PARI.
 *    Problemi: kur duhen tre kërkesa njëra pas tjetrës → "callback hell",
 *    piramida e kthimeve që rrëshqet gjithnjë më në të djathtë.
 * ========================================================================= */
export function fetchStudentsCallback(callback, { fail = false } = {}) {
    setTimeout(() => {
        if (fail) {
            callback(new ApiError("Serveri i simuluar dështoi.", { status: 500 }), null);
            return;
        }
        callback(null, SEED_STUDENTS);
    }, LATENCY_MS);
}

/* ===========================================================================
 * 2) PROMISE
 *    `new Promise((resolve, reject) => ...)` — ky është "promisifikimi":
 *    mbështjellim një API me callback brenda një Promise.
 *    Përfitimi: `.then().catch()` mund të lidhen në zinxhir të rrafshët.
 * ========================================================================= */
export function fetchStudentsPromise({ fail = false } = {}) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (fail) {
                reject(new ApiError("Serveri i simuluar dështoi.", { status: 500 }));
                return;
            }
            resolve(SEED_STUDENTS);
        }, LATENCY_MS);
    });
}

/* ===========================================================================
 * 3) ASYNC / AWAIT
 *    Sintaksë "sheqer" mbi Promise-at. Lexohet si kod sinkron.
 *    KUJTOJE: një funksion `async` kthen GJITHMONË një Promise.
 * ========================================================================= */
export async function fetchStudentsAsync({ fail = false } = {}) {
    await sleep(LATENCY_MS); // pauzë, pa e bllokuar faqen
    if (fail) {
        throw new ApiError("Serveri i simuluar dështoi.", { status: 500 });
    }
    return SEED_STUDENTS;
}

/**
 * BONUS — pse `await` në ciklin `for` është i ngadalshëm:
 * kjo funksion bën 3 kërkesa NJËRA PAS TJETRËS (~2100ms).
 */
export async function fetchThreeTimesSequential() {
    const started = performance.now();
    const results = [];
    for (const _ of [1, 2, 3]) {
        results.push(await fetchStudentsAsync());
    }
    return { ms: Math.round(performance.now() - started), batches: results.length };
}

/**
 * ...dhe kjo i bën TË TRE NJËKOHËSISHT (~700ms).
 * MËSIMI: Java 8 — konkurrenca me Promise.all.
 */
export async function fetchThreeTimesParallel() {
    const started = performance.now();
    const results = await Promise.all([
        fetchStudentsAsync(),
        fetchStudentsAsync(),
        fetchStudentsAsync(),
    ]);
    return { ms: Math.round(performance.now() - started), batches: results.length };
}
