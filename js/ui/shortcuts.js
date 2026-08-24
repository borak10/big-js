/* ============================================================================
 * ui/shortcuts.js  —  Shkurtesat e tastierës
 * MËSIMI: Java 9 — eventët e tastierës, `event.key`, bubbling
 *
 * RREGULLI I ARTË: një shkurtesë NUK duhet të shkrepet kur përdoruesi
 * po shkruan në një fushë. Prandaj kontrollojmë `isTyping()` të parën.
 * ==========================================================================*/

import { focusSearch } from "./filters.js";
import { showTab } from "./tabs.js";
import { cycleTheme, getThemeLabel } from "./theme.js";
import { toastInfo, toastSuccess } from "./toast.js";

/** A është fokusi brenda një fushe shkrimi? */
const isTyping = () => {
    const node = document.activeElement;
    if (!node) return false;
    return (
        node.tagName === "INPUT" ||
        node.tagName === "TEXTAREA" ||
        node.tagName === "SELECT" ||
        node.isContentEditable
    );
};

const TAB_BY_NUMBER = { 1: "panel", 2: "students", 3: "lab", 4: "lesson" };

export function initShortcuts({ actions, onThemeChange }) {
    document.addEventListener("keydown", (event) => {
        /* ── Ctrl/Cmd + Z: kthe fshirjen e fundit ── */
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !isTyping()) {
            event.preventDefault();
            const restored = actions.undoDelete();
            restored
                ? toastSuccess(`${restored.name} u kthye.`)
                : toastInfo("Nuk ka çka të kthehet.");
            return;
        }

        // Nga këtu poshtë: vetëm shkurtesa me një tast, kur NUK shkruajmë.
        if (isTyping() || event.ctrlKey || event.metaKey || event.altKey) return;

        /* ── "/" : shko te kërkimi ── */
        if (event.key === "/") {
            event.preventDefault(); // përndryshe "/" shkruhet në fushë
            showTab("students");
            focusSearch();
            return;
        }

        /* ── "t" : ndrysho temën ── */
        if (event.key.toLowerCase() === "t") {
            cycleTheme();
            onThemeChange?.();
            toastInfo(`Tema: ${getThemeLabel()}`);
            return;
        }

        /* ── "1"–"4" : kalo mes tabs ── */
        const tab = TAB_BY_NUMBER[event.key];
        if (tab) showTab(tab);
    });
}
