/* ============================================================================
 * services/api.js  —  Fetch i vërtetë ndaj API-ve publike
 * MËSIMI: Java 6 (Fetch + async/await), Java 7 (try/catch/finally + JSON),
 *         Java 8 (Promise.allSettled — konkurrencë)
 *
 * TRE GABIMET KLASIKE që i rregullojmë këtu:
 *   1. Të harrosh `response.ok` → fetch NUK hedh gabim për 404/500!
 *   2. Të lësh kërkesën të presë pafundësisht → AbortController + timeout.
 *   3. Të mos ketë plan B → `Promise.allSettled` + të dhëna rezervë.
 * ==========================================================================*/

import { API, COURSES } from "../config.js";
import { ApiError } from "../core/errors.js";
import { FALLBACK_QUOTES } from "../data/seed.js";
import { Student } from "../models/index.js";

/**
 * Mbështjellësi i ynë mbi `fetch`. Çdo kërkesë kalon nga këtu.
 * @returns {Promise<any>} JSON-i i përgjigjes
 */
async function request(url, { timeoutMs = API.timeoutMs, signal } = {}) {
    // AbortController = "ndërprerësi" i kërkesës.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Nëse thirrësi ka sinjalin e vet, e lidhim me tonin.
    signal?.addEventListener("abort", () => controller.abort(), { once: true });

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
        });

        // ⚠️ RRESHTI MË I HARRUAR NË JAVASCRIPT:
        // fetch e refuzon Promise-in VETËM për gabim rrjeti. 404 dhe 500 janë
        // "sukses" për fetch — duhet t'a kontrollojmë vetë `response.ok`.
        if (!response.ok) {
            throw new ApiError(`Kërkesa dështoi.`, { status: response.status, url });
        }

        return await response.json(); // edhe kjo mund të hedhë gabim (JSON i thyer)
    } catch (error) {
        if (error instanceof ApiError) throw error;

        if (error.name === "AbortError") {
            throw new ApiError(`Kërkesa u ndërpre pas ${timeoutMs}ms.`, { url, cause: error });
        }
        // TypeError = ose offline, ose i bllokuar nga CORS.
        throw new ApiError("Nuk arritëm te serveri.", { status: 0, url, cause: error });
    } finally {
        // `finally` ekzekutohet gjithmonë — edhe pas `return`, edhe pas `throw`.
        // Pa këtë, timer-i do të mbetej varur në memorie.
        clearTimeout(timer);
    }
}

/* ---------------------------------------------------------------- endpoints --- */

/**
 * Merr studentë "të vërtetë" nga randomuser.me dhe i përkthen në modelin tonë.
 * @returns {Promise<Student[]>}
 */
export async function fetchRandomStudents(count = 5) {
    const url = `${API.randomUser}?results=${count}&inc=name,dob,email&nat=gb,us,de,fr`;
    const data = await request(url);

    if (!Array.isArray(data?.results)) {
        throw new ApiError("Përgjigjja e API-së nuk kishte formatin e pritur.", { url });
    }

    // map + modulo për t'i shpërndarë nëpër kurse.
    return data.results.map((user, index) =>
        Student.fromApiUser(user, { course: COURSES[index % COURSES.length] })
    );
}

/**
 * Citat i ditës. Nëse API-ja bie, kthejmë një citat lokal —
 * përdoruesi nuk e vë re fare. Ky është "graceful degradation".
 */
export async function fetchQuote() {
    try {
        const data = await request(API.quote, { timeoutMs: 4000 });
        return {
            quote: data?.quote ?? "—",
            author: data?.author ?? "Anonim",
            source: "api",
        };
    } catch (error) {
        console.warn("[api] citati dështoi, po përdor rezervën:", error.message);
        const random = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        return { ...random, source: "fallback" };
    }
}

/**
 * KONKURRENCË (Java 8): dy kërkesa NJËKOHËSISHT.
 *
 * `Promise.all`        → nëse një dështon, dështojnë të gjitha.
 * `Promise.allSettled` → pret të gjitha dhe raporton secilën veç:
 *                        { status: "fulfilled" | "rejected" }
 * Për UI, `allSettled` është pothuajse gjithmonë zgjedhja e duhur.
 */
export async function loadRemoteBundle({ studentCount = 5 } = {}) {
    const started = performance.now();

    const [studentsResult, quoteResult] = await Promise.allSettled([
        fetchRandomStudents(studentCount),
        fetchQuote(),
    ]);

    return {
        students: studentsResult.status === "fulfilled" ? studentsResult.value : [],
        studentsError: studentsResult.status === "rejected" ? studentsResult.reason : null,
        quote: quoteResult.status === "fulfilled" ? quoteResult.value : null,
        ms: Math.round(performance.now() - started),
    };
}
