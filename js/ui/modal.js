/* ============================================================================
 * ui/modal.js  —  Konfirmim me Promise
 * MËSIMI: Java 5 (Promise) + Java 9 (<dialog>, event listeners)
 *
 * `confirm()` i shfletuesit BLLOKON gjithë faqen dhe nuk stilizohet.
 * Ne ndërtojmë versionin tonë që kthen Promise, kështu shkruajmë:
 *
 *     if (await confirmDialog({ text: "Ta fshij?" })) { ... }
 *
 * Ky është shembulli më i mirë se pse Promise-at nuk janë "vetëm për rrjet".
 * ==========================================================================*/

import { $ } from "./dom.js";

let dialog, titleNode, textNode, okButton, cancelButton;

export function initModal() {
    dialog = $("#confirmDialog");
    titleNode = $("#confirmTitle");
    textNode = $("#confirmText");
    okButton = $("#confirmOk");
    cancelButton = $("#confirmCancel");
}

/**
 * @returns {Promise<boolean>} true nëse përdoruesi konfirmoi
 */
export function confirmDialog({
    title = "A jeni i sigurt?",
    text = "Ky veprim nuk mund të kthehet.",
    confirmLabel = "Vazhdo",
    cancelLabel = "Anulo",
    danger = true,
} = {}) {
    // Nëse <dialog> mungon, kthehemi te confirm() nativ (progressive enhancement).
    if (!dialog?.showModal) {
        return Promise.resolve(window.confirm(`${title}\n\n${text}`));
    }

    titleNode.textContent = title;
    textNode.textContent = text;
    okButton.textContent = confirmLabel;
    cancelButton.textContent = cancelLabel;
    okButton.classList.toggle("btn--danger", danger);
    okButton.classList.toggle("btn--primary", !danger);

    return new Promise((resolve) => {
        /* `once: true` → listener-i shlyhet vetë pas thirrjes së parë.
           Pa të, dialogu i dytë do të kishte dy listener-a dhe do të
           zgjidhte Promise-in dy herë (bug i heshtur, shumë i shpeshtë!). */
        const finish = (result) => {
            cleanup();
            dialog.close();
            resolve(result);
        };

        const onOk = () => finish(true);
        const onCancel = () => finish(false);
        // `Esc` e mbyll dialogun pa kaluar nga butonat → e trajtojmë veç.
        const onClose = () => {
            cleanup();
            resolve(false);
        };

        function cleanup() {
            okButton.removeEventListener("click", onOk);
            cancelButton.removeEventListener("click", onCancel);
            dialog.removeEventListener("close", onClose);
        }

        okButton.addEventListener("click", onOk);
        cancelButton.addEventListener("click", onCancel);
        dialog.addEventListener("close", onClose);

        dialog.showModal();
        cancelButton.focus();
    });
}
