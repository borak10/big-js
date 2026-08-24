/* ============================================================================
 * ui/labs/index.js  —  Barrel + inicializuesi i të gjithë laboratorëve
 * MËSIMI: Java 4 & 11 — një pikë hyrje për një grup modulesh
 *
 * `main.js` thërret vetëm `initLabs()`. Nëse nesër shtojmë një lab të pestë,
 * `main.js` nuk ndryshon fare. Kjo është "open for extension, closed for
 * modification" në praktikë.
 * ==========================================================================*/

import { initEventLoopLab } from "./eventLoopLab.js";
import { initAsyncLab } from "./asyncLab.js";
import { initWebApiLab } from "./webApiLab.js";
import { initStorageLab, renderStorageLab } from "./storageLab.js";

export function initLabs() {
    initEventLoopLab();
    initAsyncLab();
    initWebApiLab();
    initStorageLab();
}

export { renderStorageLab };
