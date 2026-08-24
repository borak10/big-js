/* ============================================================================
 * ui/labs/asyncLab.js  —  Callback vs Promise vs async/await
 * MËSIMI: Java 5, 6, 7, 8
 *
 * I njëjti rezultat, tre stile. Aktivizoni «Simulo gabim» dhe shikoni
 * si trajtohet gabimi në secilin: `if (error)`, `.catch()`, `try/catch`.
 * ==========================================================================*/

import {
    fetchStudentsAsync,
    fetchStudentsCallback,
    fetchStudentsPromise,
    fetchThreeTimesParallel,
    fetchThreeTimesSequential,
} from "../../services/mockApi.js";
import { describeError } from "../../core/errors.js";
import { $ } from "../dom.js";
import { createLogPanel } from "./logPanel.js";

export function initAsyncLab() {
    const log = createLogPanel("#asyncOutput");
    const shouldFail = () => $("#failToggle").checked;

    /* ═══════════════════════════ 1) CALLBACK ═══════════════════════════ */
    $("#callbackBtn").addEventListener("click", () => {
        log.group("🔁 Stili CALLBACK");
        log.line("Thërras fetchStudentsCallback(...)", "muted");

        fetchStudentsCallback(
            (error, students) => {
                // Konventa: gabimi është argumenti I PARË. Duhet t'a kontrollojmë VETË.
                if (error) {
                    log.line(`❌ ${describeError(error)}`, "danger");
                    log.line("Kontrolli i gabimit: `if (error) { ... }`", "muted");
                    return;
                }
                log.line(`✓ ${students.length} studentë (nga callback)`, "ok");
                log.line("Problemi: tre kërkesa të varura → tre nivele kthimi (callback hell).", "muted");
            },
            { fail: shouldFail() }
        );

        // Ky rresht shtypet PARA rezultatit — dëshmi që kodi nuk pret.
        log.line("↳ Rreshti pas thirrjes ekzekutohet i pari (jo-bllokues).", "warn");
    });

    /* ═══════════════════════════ 2) PROMISE ════════════════════════════ */
    $("#promiseBtn").addEventListener("click", () => {
        log.group("🤝 Stili PROMISE");
        log.line("Thërras fetchStudentsPromise() → zinxhir .then()", "muted");

        fetchStudentsPromise({ fail: shouldFail() })
            .then((students) => {
                log.line(`✓ ${students.length} studentë (nga .then)`, "ok");
                // Kthimi i një vlere brenda `.then` e kalon te `.then`-i tjetër.
                return students.filter((student) => student.grade >= 4).length;
            })
            .then((excellent) => log.line(`↳ Me notë 4+: ${excellent}`, "ok"))
            .catch((error) => {
                log.line(`❌ ${describeError(error)}`, "danger");
                log.line("Një `.catch()` në fund kap gabimin e ÇDO hapi më parë.", "muted");
            })
            .finally(() => log.line("finally: ekzekutohet gjithmonë (fshij spinner-in).", "muted"));
    });

    /* ═════════════════════════ 3) ASYNC / AWAIT ════════════════════════ */
    $("#asyncBtn").addEventListener("click", async () => {
        log.group("✨ Stili ASYNC / AWAIT");

        try {
            log.line("await fetchStudentsAsync() — po pres…", "muted");
            const students = await fetchStudentsAsync({ fail: shouldFail() });

            log.line(`✓ ${students.length} studentë (nga await)`, "ok");
            log.line("Lexohet si kod sinkron, por nuk bllokon asgjë.", "muted");
        } catch (error) {
            // I njëjti try/catch që përdorim për kodin sinkron. Ky është magji.
            log.line(`❌ ${describeError(error)}`, "danger");
            log.line("`await` + `try/catch` = trajtim gabimesh i njëjtë me kodin sinkron.", "muted");
        } finally {
            log.line("finally: pastrimi ndodh sido që të shkojë.", "muted");
        }
    });

    /* ══════════════════ 4) SEKUENCIAL vs PARALEL (Java 8) ═════════════════ */
    $("#raceBtn").addEventListener("click", async () => {
        log.group("⚡ Sekuencial vs Paralel");
        log.line("Tri kërkesa, e njëjta punë, dy strategji…", "muted");

        const sequential = await fetchThreeTimesSequential();
        log.line(`🐢 for + await (njëra pas tjetrës): ${sequential.ms}ms`, "danger");

        const parallel = await fetchThreeTimesParallel();
        log.line(`🐇 Promise.all([...]): ${parallel.ms}ms`, "ok");

        const saved = sequential.ms - parallel.ms;
        log.line(
            `Kursim: ${saved}ms (~${Math.round((saved / sequential.ms) * 100)}%). ` +
            `Përdor Promise.all kur kërkesat NUK varen nga njëra-tjetra.`,
            "warn"
        );
    });

    $("#asyncClear").addEventListener("click", log.clear);
}
