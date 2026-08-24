/* ============================================================================
 * app/quickActions.js  —  Butonat "e mëdhenj" dhe fshirja me konfirmim
 * MËSIMI: Java 5–8 (async në UI real) + Java 9 (gjendjet e butonave)
 *
 * NJË MODEL që përsëritet në çdo aplikacion serioz:
 *      çaktivizo butonin → trego "po ngarkohet" → provo → trego rezultatin
 *      → RIKTHE butonin në `finally`
 * Pa `finally`, një gabim i vetëm e lë butonin të bllokuar përgjithmonë.
 * ==========================================================================*/

import { fetchRandomStudents } from "../services/api.js";
import { clearStudents } from "../services/storage.js";
import { describeError } from "../core/errors.js";
import { plural } from "../core/utils.js";
import { $ } from "../ui/dom.js";
import { confirmDialog } from "../ui/modal.js";
import { toastError, toastInfo, toastSuccess, toastWarn } from "../ui/toast.js";

export function initQuickActions({ store, actions }) {
  /* ─────────────────────────────── Mbush me shembuj (lokalisht) ────────── */
  $("#seedBtn").addEventListener("click", () => {
    const { added, skipped } = actions.seed();

    if (added === 0) {
      toastInfo("Të gjithë shembujt janë shtuar më parë.");
      return;
    }
    toastSuccess(
      `${plural(added, "student u shtua", "studentë u shtuan")}.` +
        (skipped ? ` ${skipped} dublikatë u anashkaluan.` : "")
    );
  });

  /* ─────────────────────────────── Importo nga API (rrjet i vërtetë) ───── */
  $("#importApiBtn").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const original = button.textContent;

    button.disabled = true;
    button.textContent = "⏳ Po marr…";

    try {
      const students = await fetchRandomStudents(5);
      const { added, skipped } = actions.addMany(students);

      toastSuccess(
        `${plural(added, "student i importuar", "studentë të importuar")} nga randomuser.me.` +
          (skipped ? ` ${skipped} u anashkaluan.` : "")
      );
    } catch (error) {
      toastError(describeError(error));
      console.error("[importApi]", error);
    } finally {
      // GJITHMONË. Edhe pas gabimit, edhe pas suksesit.
      button.disabled = false;
      button.textContent = original;
    }
  });

  /* ─────────────────────────────── Fshij të gjithë (me konfirmim) ──────── */
  $("#clearAllBtn").addEventListener("click", async () => {
    const total = store.getState().students.length;

    if (total === 0) {
      toastInfo("Lista është bosh.");
      return;
    }

    // `await` mbi një dialog. Kodi lexohet si një bisedë.
    const confirmed = await confirmDialog({
      title: "Fshij të gjithë studentët?",
      text: `${plural(total, "student", "studentë")} do të fshihen përgjithmonë. ` +
        `Këshillë: shkarkojini si JSON para se t'a bëni.`,
      confirmLabel: "Fshij të gjithë",
    });

    if (!confirmed) {
      toastInfo("Anuluar — asgjë nuk u fshi.");
      return;
    }

    actions.clearAll();
    clearStudents(); // fshijmë edhe çelësin në localStorage
    toastWarn(`${plural(total, "student u fshi", "studentë u fshinë")}.`);
  });
}

/**
 * Fshirja e një studenti: konfirmim + toast me butonin "Kthe" (undo).
 * Eksportohet veç, sepse `ui/studentList.js` e thërret nga delegimi.
 */
export function createDeleteHandler({ actions }) {
  return async (id) => {
    const student = actions.deleteStudent(id);
    if (!student) return;

    /* Fshirje OPTIMISTE: e heqim menjëherë (ndërfaqja duket e shpejtë)
       dhe ofrojmë kthimin. Më e mirë se një dialog për çdo klikim. */
    toastWarn(`${student.name} u fshi.`, {
      duration: 6000,
      action: {
        label: "↶ Kthe",
        onClick: () => {
          const restored = actions.undoDelete();
          if (restored) toastSuccess(`${restored.name} u kthye.`);
        },
      },
    });
  };
}
