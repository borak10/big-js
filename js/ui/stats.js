/* ============================================================================
 * ui/stats.js  —  Paneli i statistikave
 * MËSIMI: Java 2 (të dhëna të derivuara) + Java 9 (DOM)
 *
 * Vini re: ky modul NUK llogarit asgjë. Ai vetëm e shfaq atë që
 * `core/statistics.js` ka llogaritur. Ndarja "llogarit vs shfaq" e mban
 * matematikën të testueshme dhe UI-në të thjeshtë.
 * ==========================================================================*/

import { buildSummary } from "../core/statistics.js";
import { plural } from "../core/utils.js";
import { $, clear, el } from "./dom.js";

export function renderStats(state) {
    const summary = buildSummary(state.students);

    $("#statTotal").textContent = summary.total;
    $("#statTotalHint").textContent =
        summary.total === 0
            ? "Asnjë student i regjistruar"
            : `${plural(summary.passing, "kalues", "kalues")} nga ${summary.total}`;

    $("#statAverage").textContent = summary.average.toFixed(2);
    $("#statMedian").textContent = summary.median;

    $("#statPassRate").textContent = `${summary.passRate}%`;
    $("#statPassMeter").style.width = `${summary.passRate}%`;
    // Ngjyra e shiritit ndryshon sipas vlerës — feedback vizual pa tekst.
    $("#statPassMeter").dataset.tone =
        summary.passRate >= 75 ? "ok" : summary.passRate >= 40 ? "warn" : "danger";

    /* Vetëm `textContent`, kurrë `innerHTML`.
       Përveç sigurisë (XSS), ka një arsye praktike: `innerHTML` i zëvendëson
       TË GJITHË fëmijët. Nëse një fëmijë ka ID që e lexojmë në vizatimin tjetër,
       ai do të kishte zhdukur — dhe vizatimi i dytë do pëlciste me
       "Cannot set properties of null". Ky ishte një bug i vërtetë në këtë projekt. */
    $("#statTop").textContent = summary.top ? summary.top.name : "—";
    $("#statTopGrade").textContent = summary.top ? summary.top.grade : "—";
    $("#statAge").textContent = summary.averageAge;

    renderCourseBreakdown(summary.courses);
}

/** Një rresht për secilin kurs, me shirit proporcional. */
function renderCourseBreakdown(courses) {
    const container = clear($("#courseBreakdown"));

    if (courses.length === 0) {
        container.append(el("p", { class: "hint", text: "Asnjë e dhënë për të grupuar." }));
        return;
    }

    const max = Math.max(...courses.map((course) => course.count));

    for (const { course, count, average, passRate } of courses) {
        container.append(
            el(
                "div",
                { class: "breakdown__row" },
                el("span", { class: "breakdown__label", text: course }),
                el(
                    "div",
                    { class: "breakdown__bar" },
                    el("div", {
                        class: "breakdown__fill",
                        style: `width:${(count / max) * 100}%`,
                        "data-tone": passRate >= 75 ? "ok" : passRate >= 40 ? "warn" : "danger",
                    })
                ),
                el("span", {
                    class: "breakdown__value",
                    text: `${count} · ⌀ ${average} · ${passRate}%`,
                })
            )
        );
    }
}
