/* ============================================================================
 * ui/importExport.js  —  Shkarko / lexo JSON
 * MËSIMI: Java 7 (JSON + try/catch) + Java 10 (File API, Blob) + Java 5 (Promise)
 *
 * `FileReader` është një API i VJETËR me eventë (`onload`, `onerror`).
 * Ne e mbështjellim në Promise — pikërisht si bëmë me Geolocation.
 * Shihni sa herë përsëriten të njëjtat modele: kjo është aftësia e vërtetë.
 * ==========================================================================*/

import { describeError } from "../core/errors.js";
import { $, downloadFile } from "./dom.js";
import { toastError, toastInfo, toastSuccess } from "./toast.js";

/** @returns {Promise<string>} përmbajtja e skedarit si tekst */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Skedari nuk mund të lexohej."));
        reader.readAsText(file);
    });
}

export function initImportExport({ actions }) {
    /* -------------------------------------------------------------- eksport --- */
    $("#exportBtn").addEventListener("click", () => {
        const payload = actions.exportPayload();

        if (payload.count === 0) {
            toastInfo("Nuk ka studentë për t'u eksportuar.");
            return;
        }

        // Argumenti i tretë `2` = indentim → JSON i lexueshëm nga njeriu.
        const json = JSON.stringify(payload, null, 2);
        const stamp = new Date().toISOString().slice(0, 10); // 2026-08-17
        downloadFile(`studentet-${stamp}.json`, json);
        toastSuccess(`${payload.count} studentë u shkarkuan.`);
    });

    /* --------------------------------------------------------------- import --- */
    const fileInput = $("#importFile");

    fileInput.addEventListener("change", async (event) => {
        const [file] = event.target.files; // destructuring i FileList
        if (!file) return;

        try {
            const text = await readFileAsText(file);

            /* DY gabime të mundshme, dy mesazhe të ndryshme:
               1) JSON.parse dështon → skedar i thyer
               2) struktura nuk përputhet → skedar i gabuar          */
            let raw;
            try {
                raw = JSON.parse(text);
            } catch {
                throw new Error("Skedari nuk është JSON i vlefshëm.");
            }

            const { added, skipped } = actions.importFromJson(raw);

            toastSuccess(
                `U importuan ${added} studentë.` + (skipped > 0 ? ` ${skipped} dublikatë u anashkaluan.` : "")
            );
        } catch (error) {
            toastError(describeError(error));
            console.error("[import]", error);
        } finally {
            // Pastrojmë inputin, përndryshe zgjedhja e TË NJËJTIT skedar
            // dy herë rresht nuk shkrep `change`. Kurth klasik!
            fileInput.value = "";
        }
    });
}
