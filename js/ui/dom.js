/* ============================================================================
 * ui/dom.js  —  Ndihmësa për DOM
 * MËSIMI: Java 9 — manipulim i avancuar i DOM-it, <template>, cloneNode
 *
 * ÇDO modul UI kalon nga këtu. Përfitimi: nëse nesër ndryshojmë strukturën
 * e HTML-së, prekim një skedar, jo dhjetë.
 * ==========================================================================*/

/** querySelector me shkurtim. `$("#name")` */
export const $ = (selector, root = document) => root.querySelector(selector);

/** querySelectorAll → VARG i vërtetë (jo NodeList), kështu ka .map/.filter */
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Krijues elementesh. Zëvendëson pesë rreshta `createElement` + `appendChild`.
 *   el("p", { class: "hint", text: "Përshëndetje" })
 *   el("button", { class: "btn", onclick: handler }, "Kliko")
 */
export function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);

    for (const [key, value] of Object.entries(props)) {
        if (value === null || value === undefined || value === false) continue;

        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "html") node.innerHTML = value; // përdore vetëm me tekst TËND
        else if (key === "dataset") Object.assign(node.dataset, value);
        else if (key.startsWith("on") && typeof value === "function") {
            node.addEventListener(key.slice(2).toLowerCase(), value);
        } else node.setAttribute(key, value === true ? "" : value);
    }

    node.append(...children.flat().filter((child) => child !== null && child !== undefined));
    return node;
}

/** Fshirje e shpejtë e fëmijëve. Më e pastër se `node.innerHTML = ""`. */
export function clear(node) {
    node?.replaceChildren();
    return node;
}

/**
 * Klonon një <template> dhe kthen elementin e brendshëm.
 * `cloneNode(true)` = klon i thellë (me të gjithë fëmijët).
 * Pa `true` do të merrnim vetëm shënjestrën bosh.
 */
export function fromTemplate(templateId) {
    const template = $(`#${templateId}`);
    if (!template) throw new Error(`Template "#${templateId}" nuk u gjet.`);
    return template.content.firstElementChild.cloneNode(true);
}

/** Mbush pikat `data-slot="x"` brenda një klon-i. Zero `innerHTML`. */
export function fillSlots(root, values = {}) {
    for (const [slot, value] of Object.entries(values)) {
        const target = root.querySelector(`[data-slot="${slot}"]`);
        if (target) target.textContent = value ?? "";
    }
    return root;
}

/** Shfaq/fshih pa e hequr nga DOM-i. Atributi `hidden` është nativ. */
export const toggle = (node, visible) => {
    if (node) node.hidden = !visible;
};

/** Mbush një <select> nga një varg. Pranon string ose {value,label}. */
export function fillSelect(select, options, selected) {
    if (!select) return;
    clear(select);
    for (const option of options) {
        const { value, label } = typeof option === "string" ? { value: option, label: option } : option;
        select.append(el("option", { value, selected: value === selected }, label));
    }
    if (selected !== undefined) select.value = selected;
}

/**
 * DELEGIM I EVENTEVE — teknika më e rëndësishme e Javës 9.
 * Në vend të një listener-i për SECILIN buton (dhe rilidhjes pas çdo
 * rivizatimi), lidhim NJË listener në prindin. Eventet "fluturojnë" lart
 * (bubbling) dhe `closest()` na thotë nga cili buton erdhi klikimi.
 */
export function delegate(root, eventName, selector, handler) {
    root.addEventListener(eventName, (event) => {
        const match = event.target.closest(selector);
        if (match && root.contains(match)) handler(event, match);
    });
}

/** Shkarkon një skedar të gjeneruar në shfletues (Java 10 — Blob + URL API). */
export function downloadFile(filename, content, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = el("a", { href: url, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
    // Pa `revokeObjectURL` rrjedh memorie — pjesë e higjienës së Web API-ve.
    URL.revokeObjectURL(url);
}
