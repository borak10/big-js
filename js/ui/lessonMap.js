/* ============================================================================
 * ui/lessonMap.js  —  Dokumentacioni brenda aplikacionit
 * MËSIMI: Java 9 (<details>, DOM nga të dhëna) + Java 4 (të dhëna ≠ paraqitje)
 *
 * Nga një varg objektesh ndërtojmë të gjithë hartën e mësimit.
 * Kurrë "HTML me copy-paste 12 herë".
 * ==========================================================================*/

import { LESSONS } from "../data/lessons.js";
import { $, clear, el } from "./dom.js";

export function renderLessonMap() {
    const container = $("#lessonMap");
    if (!container || container.dataset.rendered === "true") return;

    clear(container);

    // Grupim sipas mujit: reduce → { 1: [...], 2: [...], 3: [...] }
    const months = LESSONS.reduce((groups, lesson) => {
        (groups[lesson.month] ??= []).push(lesson);
        return groups;
    }, {});

    const MONTH_TITLES = {
        1: "Muaji 1 · Koncepte të thelluara",
        2: "Muaji 2 · JavaScript asinkron",
        3: "Muaji 3 · JS në shfletues & projekte",
    };

    for (const [month, lessons] of Object.entries(months)) {
        container.append(
            el("h2", { class: "lesson-month", text: MONTH_TITLES[month] ?? `Muaji ${month}` })
        );

        for (const lesson of lessons) {
            container.append(buildLessonCard(lesson));
        }
    }

    container.dataset.rendered = "true";
}

function buildLessonCard({ week, title, topics, files, look }) {
    /* `<details>` / `<summary>` = akordion NATIV.
       Zero JavaScript për hapje/mbyllje, punon edhe pa JS. */
    return el(
        "details",
        { class: "lesson" },
        el(
            "summary",
            { class: "lesson__head" },
            el("span", { class: "lesson__week", text: `Java ${week}` }),
            el("span", { class: "lesson__title", text: title })
        ),
        el(
            "div",
            { class: "lesson__body" },
            el(
                "div",
                { class: "lesson__topics" },
                ...topics.map((topic) => el("code", { class: "topic", text: topic }))
            ),
            el("p", { class: "lesson__look", text: look }),
            el("p", { class: "lesson__files-label", text: "Shiko në kod:" }),
            el(
                "ul",
                { class: "lesson__files" },
                ...files.map((file) => el("li", {}, el("code", { text: file })))
            )
        )
    );
}
