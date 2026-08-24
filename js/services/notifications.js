/* ============================================================================
 * services/notifications.js  —  Notification API
 * MËSIMI: Java 10 — Web APIs dhe modeli i LEJEVE (permissions)
 *
 * Rregulli i artë i lejeve: kërko lejen VETËM pas një veprimi të përdoruesit
 * (klikim). Shfletuesit bllokojnë kërkesat automatike gjatë ngarkimit.
 * ==========================================================================*/

export const isSupported = () => "Notification" in window;

/** "default" (pa vendosur) | "granted" | "denied" */
export const permission = () => (isSupported() ? Notification.permission : "unsupported");

export async function requestPermission() {
    if (!isSupported()) {
        throw new Error("Shfletuesi i juaj nuk mbështet njoftimet.");
    }
    if (Notification.permission === "denied") {
        throw new Error("Njoftimet janë bllokuar. Hapni cilësimet e faqes (🔒 pranë URL-së).");
    }
    // Në shfletuesët e vjetër kthente callback; sot kthen Promise.
    return await Notification.requestPermission();
}

/**
 * Shfaq një njoftim. Kthen `true` nëse ia dolli.
 * KUJDES: në `file://` njoftimet shpesh nuk punojnë → përdorni Live Server!
 */
export async function notify(title, { body = "", tag = "akademia" } = {}) {
    if (!isSupported()) return false;

    if (Notification.permission !== "granted") {
        const result = await requestPermission();
        if (result !== "granted") return false;
    }

    new Notification(title, { body, tag, icon: "assets/icon.svg" });
    return true;
}
