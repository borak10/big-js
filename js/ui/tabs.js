/* ============================================================================
 * ui/tabs.js  —  Navigimi mes pamjeve
 * MËSIMI: Java 9 (delegim eventesh, aria) + Java 10 (sessionStorage)
 *
 * Tab-i aktiv ruhet në sessionStorage: rifreskoni faqen dhe mbeteni ku ishit,
 * por hapja e një tab-i të re fillon nga e para. Krahasojeni me temën, që
 * ruhet në localStorage — zgjedhje e qëllimshme, jo rastësi.
 * ==========================================================================*/

import { loadActiveTab, saveActiveTab } from "../services/storage.js";
import { $, $$, delegate } from "./dom.js";

let active = "panel";
const subscribers = new Set();

export const getActiveTab = () => active;
export const onTabChange = (fn) => subscribers.add(fn);

export function showTab(name) {
    const buttons = $$(".tab");
    if (!buttons.some((button) => button.dataset.tab === name)) name = "panel";

    active = name;
    saveActiveTab(active);

    for (const button of buttons) {
        const isActive = button.dataset.tab === active;
        button.classList.toggle("tab--active", isActive);
        button.setAttribute("aria-selected", String(isActive));
    }

    for (const view of $$(".view")) {
        view.hidden = view.dataset.view !== active;
    }

    for (const fn of subscribers) fn(active);
}

export function initTabs() {
    // NJË listener për të gjithë tabs — delegim.
    delegate($(".tabs"), "click", ".tab", (_event, button) => showTab(button.dataset.tab));
    showTab(loadActiveTab());
}
