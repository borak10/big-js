/* ============================================================================
 * ui/labs/logPanel.js  —  Panel i vogël log-imi, i ripërdorshëm
 * MËSIMI: Java 2 (fabrikë funksionesh) + Java 4 (modul i ripërdorshëm)
 *
 * Të tre laboratorët kanë nevojë për "shkruaj një rresht me kohën".
 * Në vend që t'a kopjojmë tri herë, e shkruajmë njëherë dhe e importojmë.
 * KJO është arsyeja pse ekzistojnë modulet.
 * ==========================================================================*/

import { formatTime } from "../../core/utils.js";
import { $, clear, el } from "../dom.js";

/**
 * @param {string} selector  ku shkruajmë, p.sh. "#eventLoopOutput"
 * @returns {{ line: Function, clear: Function, group: Function }}
 */
export function createLogPanel(selector) {
    const node = $(selector);
    let startedAt = performance.now();

    /**
     * @param {string} text
     * @param {"info"|"ok"|"warn"|"danger"|"muted"} tone
     */
    const line = (text, tone = "info") => {
        if (!node) return;
        const elapsed = Math.round(performance.now() - startedAt);
        node.append(
            el(
                "li",
                { class: `log__line log__line--${tone}` },
                el("span", { class: "log__time", text: `+${String(elapsed).padStart(4, " ")}ms` }),
                el("span", { class: "log__text", text })
            )
        );
        node.scrollTop = node.scrollHeight; // rrëshqit poshtë vetë
        console.log(`[${formatTime()}] ${text}`); // edhe në Console (Java 4: debug)
    };

    const reset = () => {
        startedAt = performance.now();
        if (node) clear(node);
    };

    /** Kokë seksioni, për t'i ndarë ekzekutimet. */
    const group = (title) => {
        startedAt = performance.now();
        if (!node) return;
        node.append(el("li", { class: "log__group", text: title }));
    };

    return { line, clear: reset, group };
}
