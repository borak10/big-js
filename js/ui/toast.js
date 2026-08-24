/* ============================================================================
 * ui/toast.js  —  Njoftime brenda faqes
 * MËSIMI: Java 9 (DOM) + Java 2 (closures) + Java 8 (setTimeout & cleanup)
 *
 * Zëvendëson `showMessage()` e Javës 11. Përparësia: mund të shfaqen
 * SHUMË mesazhe njëherësh dhe secili ka timer-in e vet.
 * ==========================================================================*/

import { TOAST_DURATION } from "../config.js";
import { $, el } from "./dom.js";

const ICONS = { success: "✓", error: "✕", info: "ℹ", warn: "!" };

let stack = null;

/** Thirret njëherë nga main.js. */
export function initToasts() {
    stack = $("#toastStack");
}

/**
 * @param {string} message
 * @param {"success"|"error"|"info"|"warn"} type
 * @param {{ duration?: number, action?: { label: string, onClick: Function } }} options
 */
export function toast(message, type = "info", { duration = TOAST_DURATION, action } = {}) {
    if (!stack) return;

    const node = el(
        "div",
        { class: `toast toast--${type}`, role: type === "error" ? "alert" : "status" },
        el("span", { class: "toast__icon", text: ICONS[type] ?? ICONS.info }),
        el("p", { class: "toast__text", text: message })
    );

    // Butoni opsional "Kthe" (undo) — closure mbi `action`.
    if (action) {
        node.append(
            el("button", {
                class: "toast__action",
                type: "button",
                text: action.label,
                onclick: () => {
                    action.onClick();
                    remove();
                },
            })
        );
    }

    const remove = () => {
        clearTimeout(timerId);
        node.classList.add("toast--leaving");
        // Presim animacionin para se t'a heqim nga DOM-i.
        node.addEventListener("animationend", () => node.remove(), { once: true });
        setTimeout(() => node.remove(), 400); // rrjetë sigurie
    };

    node.addEventListener("click", (event) => {
        if (event.target.closest(".toast__action")) return;
        remove();
    });

    const timerId = setTimeout(remove, duration);

    stack.append(node);

    // Mos lejo më shumë se 4 njëherësh.
    while (stack.children.length > 4) stack.firstElementChild.remove();

    return remove;
}

/* Shkurtesa të lexueshme — kod thirrës më i pastër. */
export const toastSuccess = (message, options) => toast(message, "success", options);
export const toastError = (message, options) => toast(message, "error", options);
export const toastInfo = (message, options) => toast(message, "info", options);
export const toastWarn = (message, options) => toast(message, "warn", options);
