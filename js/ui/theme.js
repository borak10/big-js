/* ============================================================================
 * ui/theme.js  —  Tema e ndritshme / e errët / sipas sistemit
 * MËSIMI: Java 10 (localStorage) + Java 9 (dataset, matchMedia)
 *
 * Tri gjendje, jo dy:
 *   "system" → ndjek cilësimet e kompjuterit (matchMedia)
 *   "light" / "dark" → zgjedhje e shprehur e përdoruesit
 * CSS-i i lexon nga `<html data-theme="...">`.
 * ==========================================================================*/

import { loadTheme, saveTheme } from "../services/storage.js";
import { $ } from "./dom.js";

const ORDER = ["system", "light", "dark"];
const META = {
    system: { icon: "◐", label: "Sistemi" },
    light: { icon: "☀", label: "E ndritshme" },
    dark: { icon: "☾", label: "E errët" },
};

let current = "system";

function paint() {
    document.documentElement.dataset.theme = current;
    const icon = $("#themeIcon");
    const label = $("#themeLabel");
    if (icon) icon.textContent = META[current].icon;
    if (label) label.textContent = META[current].label;
}

/** Kalon në temën e radhës. Modulo → cikël i pafund pa `if`-e. */
export function cycleTheme() {
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setTheme(next);
    return next;
}

export function setTheme(theme) {
    current = ORDER.includes(theme) ? theme : "system";
    saveTheme(current);
    paint();
}

export const getTheme = () => current;

/** Emri i temës në shqip — për toaste dhe tekste UI. */
export const getThemeLabel = () => META[current].label;

/** A është ekrani aktualisht i errët? Grafikët e pyesin për ngjyra. */
export const isDark = () =>
    current === "dark" ||
    (current === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

export function initTheme({ onChange } = {}) {
    current = loadTheme();
    paint();

    $("#themeToggle")?.addEventListener("click", () => {
        cycleTheme();
        onChange?.(isDark());
    });

    // Nëse përdoruesi ndryshon temën e sistemit ndërsa faqja është hapur.
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
            if (current === "system") onChange?.(isDark());
        });
}
