/* ============================================================================
 * ui/labs/eventLoopLab.js  —  Laboratori i Event Loop-it
 * MËSIMI: Java 8 — event loop, call stack, microtasks vs macrotasks
 *
 * ══════════════════════════════════════════════════════════════════════
 *  MODELI MENDOR që duhet të mbajnë studentët:
 *
 *  1. CALL STACK      — kodi sinkron. Ekzekutohet MENJËHERË, deri në fund.
 *  2. MICROTASK QUEUE — `.then()`, `await`, queueMicrotask.
 *                        Zbrazet TËRËSISHT sapo stack-u lirohet.
 *  3. MACROTASK QUEUE — setTimeout, setInterval, eventët e klikimit.
 *                        Merret VETËM NJË detyrë, pastaj rikthehemi te #2.
 *
 *  Prandaj `setTimeout(fn, 0)` NUK është "tani" — është "pas gjithçkaje
 *  sinkrone dhe pas gjithë microtask-eve".
 * ══════════════════════════════════════════════════════════════════════
 */

import { $ } from "../dom.js";
import { createLogPanel } from "./logPanel.js";
import { toastWarn } from "../toast.js";

export function initEventLoopLab() {
    const log = createLogPanel("#eventLoopOutput");

    $("#eventLoopRun").addEventListener("click", () => {
        log.group("▶ Ekzekutim i re");

        /* ---- 1) SINKRON: shkon direkt në call stack ---- */
        log.line("1 · sinkron — brenda call stack", "ok");

        /* ---- 4) MACROTASK: edhe me 0ms, pret në fund të radhës ---- */
        setTimeout(() => {
            log.line("4 · macrotask (setTimeout 0) — i fundit", "danger");
            log.line("↑ Vini re: 0ms NUK do të thotë 'menjëherë'.", "muted");
        }, 0);

        /* ---- 3) MICROTASK: pas sinkronit, PARA macrotask-eve ---- */
        Promise.resolve().then(() => {
            log.line("3 · microtask (Promise.then) — para setTimeout", "warn");
        });

        /* ---- 2) SINKRON përsëri ---- */
        log.line("2 · sinkron — ende brenda call stack", "ok");

        /* BONUS: microtask-et "mbijnë" microtask-e të reja që ekzekutohen
           PARA se radha e macrotask-eve të prekë të parën e vet. */
        queueMicrotask(() => {
            log.line("3b · microtask e dytë — radha e microtask-eve zbrazet e tëra", "warn");
        });
    });

    /* -----------------------------------------------------------------------
     * DEMO: pse "JavaScript është single-threaded" ka pasoja të vërteta.
     * Një cikël `while` prej 1.5s e bllokon TË GJITHË faqen: animacionet
     * ndalen, klikimet nuk regjistrohen, timer-at akumulohen.
     * -------------------------------------------------------------------- */
    $("#eventLoopBlock").addEventListener("click", () => {
        log.group("🥶 Bllokim i qëllimshëm");
        log.line("Po planifikoj një setTimeout për 100ms…", "muted");

        const planned = performance.now();
        setTimeout(() => {
            const late = Math.round(performance.now() - planned);
            log.line(`setTimeout(100ms) u ekzekutua pas ${late}ms — me ${late - 100}ms vonesë!`, "danger");
            log.line("Timer-i nuk 'humbi', vetëm priti që stack-u të lirohej.", "muted");
        }, 100);

        toastWarn("Faqja do të ngrijë për ~1.5s. Provoni t'a klikoni butonin!");

        // Bllokim i sinkron. NUK bëhet kurrë në kod real — vetëm për mësim.
        const until = performance.now() + 1500;
        while (performance.now() < until) {
            /* thread-i i vetëm i JS-it është i zënë; shfletuesi nuk mund të vizatojë */
        }

        log.line("Bllokimi mbaroi. Tani radha e detyrave mund të vazhdojë.", "ok");
        log.line("💡 Zgjidhja në kod real: Web Workers, ose punë në pjesë të vogla.", "muted");
    });

    $("#eventLoopClear").addEventListener("click", log.clear);
}
