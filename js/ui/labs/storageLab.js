/* ============================================================================
 * ui/labs/storageLab.js  —  Çka ka vërtet brenda Storage-it?
 * MËSIMI: Java 10 — localStorage vs sessionStorage, kuota, eventi `storage`
 *
 * EKSPERIMENT për në klasë:
 *   1. Shto 3 studentë, ndrysho filtrat, kalo në tab-in "Laboratori".
 *   2. Shtyp F5 → studentët dhe filtrat kthehen (local + session).
 *   3. Mbyll tab-in, hape sërish → studentët kthehen, filtrat NUK.
 *   4. Hape faqen në dy tabs → shto student në një, shiko tjetrin.
 * ==========================================================================*/

import { STORAGE_KEYS } from "../../config.js";
import { storageReport } from "../../services/storage.js";
import { $, clear, el } from "../dom.js";
import { toastInfo } from "../toast.js";

const KIND_OF = (key) =>
    key === STORAGE_KEYS.activeTab || key === STORAGE_KEYS.filters
        ? "sessionStorage"
        : "localStorage";

export function renderStorageLab() {
    const body = $("#storageBody");
    if (!body) return;

    const report = storageReport();
    clear(body);

    for (const entry of report.entries) {
        body.append(
            el(
                "tr",
                { class: entry.empty ? "muted-row" : "" },
                el("td", { class: "mono", text: entry.key }),
                el(
                    "td",
                    {},
                    el("span", {
                        class: `pill pill--${KIND_OF(entry.key) === "localStorage" ? "local" : "session"}`,
                        text: KIND_OF(entry.key) === "localStorage" ? "local" : "session",
                    })
                ),
                el("td", { class: "right mono", text: entry.empty ? "—" : String(entry.size) })
            )
        );
    }

    body.append(
        el(
            "tr",
            { class: "total-row" },
            el("td", { text: "Totali" }),
            el("td", {
                text: `${report.localAvailable ? "✓" : "✕"} local · ${report.sessionAvailable ? "✓" : "✕"
                    } session`,
            }),
            el("td", { class: "right mono", text: `${report.totalBytes} B` })
        )
    );
}

export function initStorageLab() {
    $("#storageRefresh")?.addEventListener("click", () => {
        renderStorageLab();
        toastInfo("Raporti u rifreskua.");
    });

    /* Eventi `storage` shkrepet në TABS-AT E TJERA, jo në atë që shkroi.
       Kështu dy dritare të të njëjtit aplikacion mbeten të sinkronizuara. */
    window.addEventListener("storage", (event) => {
        console.log(`[storage] "${event.key}" ndryshoi në një tab tjetër.`);
        renderStorageLab();
        toastInfo("Të dhënat ndryshuan në një tab tjetër. Rifreskoni për t'i marrë.");
    });

    renderStorageLab();
}
