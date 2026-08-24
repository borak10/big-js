/* ============================================================================
 * ui/labs/webApiLab.js  —  Geolocation, Notifications, Network status
 * MËSIMI: Java 10 — Web APIs dhe modeli i lejeve
 *
 * KUJDES: të tre këto API kërkojnë "secure context":
 *   ✓ http://localhost  (Live Server)
 *   ✓ https://...
 *   ✗ file:///C:/...    ← dopio-klik në index.html NUK punon
 * ==========================================================================*/

import { CAMPUS } from "../../config.js";
import { describeError } from "../../core/errors.js";
import { distanceFromCampus, isSupported as geoSupported, mapLink } from "../../services/geolocation.js";
import { notify, permission, isSupported as notifySupported } from "../../services/notifications.js";
import { $, el } from "../dom.js";
import { createLogPanel } from "./logPanel.js";

export function initWebApiLab() {
    const log = createLogPanel("#webApiOutput");

    /* ═══════════════════════════ GEOLOCATION ═══════════════════════════ */
    $("#geoBtn").addEventListener("click", async (event) => {
        const button = event.currentTarget;
        log.group("📍 Geolocation");

        if (!geoSupported()) {
            log.line("Shfletuesi nuk e mbështet Geolocation.", "danger");
            return;
        }

        button.disabled = true;
        button.textContent = "⏳ Po pres lejen…";
        log.line("Shfletuesi po pyet për leje (shiriti lart) …", "muted");

        try {
            const { position, km } = await distanceFromCampus();

            log.line(`✓ Lokacioni: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`, "ok");
            log.line(`Saktësia: ±${position.accuracy}m`, "muted");
            log.line(`Distanca nga ${CAMPUS.name}: ${km} km`, "ok");

            // Lidhje reale drejt OpenStreetMap — pa bibliotekë, pa çelës.
            const output = $("#webApiOutput");
            output.append(
                el(
                    "li",
                    { class: "log__line log__line--info" },
                    el("span", { class: "log__time", text: "  →" }),
                    el(
                        "a",
                        { class: "log__link", href: mapLink(position), target: "_blank", rel: "noopener" },
                        "Hape lokacionin në OpenStreetMap ↗"
                    )
                )
            );
        } catch (error) {
            log.line(`❌ ${describeError(error)}`, "danger");
            log.line("💡 Refuzimi është përgjigje e vlefshme — kodi duhet t'a durojë.", "muted");
        } finally {
            button.disabled = false;
            button.textContent = "📍 Sa larg është kampusi?";
        }
    });

    /* ══════════════════════════ NOTIFICATIONS ══════════════════════════ */
    $("#notifyBtn").addEventListener("click", async () => {
        log.group("🔔 Notifications");

        if (!notifySupported()) {
            log.line("Shfletuesi nuk mbështet Notification API.", "danger");
            return;
        }

        log.line(`Gjendja e lejes: "${permission()}"`, "muted");

        try {
            const shown = await notify("Akademia · 7Scantech", {
                body: "Njoftimet punojnë! Kjo erdhi nga Notification API.",
            });

            shown
                ? log.line("✓ Njoftimi u shfaq (shiko qoshen e ekranit).", "ok")
                : log.line("Leja nuk u dha — asnjë njoftim.", "warn");
        } catch (error) {
            log.line(`❌ ${describeError(error)}`, "danger");
        }
    });

    /* ════════════════════════ NETWORK INFORMATION ══════════════════════ */
    $("#onlineBtn").addEventListener("click", () => {
        log.group("📶 Statusi i rrjetit");

        log.line(`navigator.onLine → ${navigator.onLine}`, navigator.onLine ? "ok" : "danger");

        // `navigator.connection` nuk ekziston në Safari/Firefox → optional chaining.
        const connection = navigator.connection ?? navigator.mozConnection;
        if (connection) {
            log.line(`Tipi i lidhjes: ${connection.effectiveType}`, "muted");
            log.line(`Shpejtësia e vlerësuar: ${connection.downlink} Mbps`, "muted");
            log.line(`Ruajtja e të dhënave (saveData): ${connection.saveData}`, "muted");
        } else {
            log.line("Network Information API nuk mbështetet këtu.", "warn");
        }

        log.line("💡 Provoni: DevTools → Network → Offline, pastaj klikoni sërish.", "muted");
    });

    $("#webApiClear").addEventListener("click", log.clear);

    /* Eventët `online` / `offline` janë të vërtetë — provojini me DevTools. */
    window.addEventListener("online", () => log.line("🌐 U kthye lidhja!", "ok"));
    window.addEventListener("offline", () => log.line("🔌 Lidhja u shkëput.", "danger"));
}
