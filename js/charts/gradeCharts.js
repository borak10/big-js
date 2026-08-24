/* ============================================================================
 * charts/gradeCharts.js  —  Integrimi me Chart.js
 * MËSIMI: Java 11 — si përdoret një BIBLIOTEKË e jashtme si duhet
 *
 * TRI RREGULLA për të mbështjellë një bibliotekë:
 *
 *  1. IZOLOJE. Vetëm ky skedar e njeh fjalën `Chart`. Nesër kalojmë në
 *     ApexCharts → prekim një skedar, jo dhjetë.
 *  2. MOS BESO që do ngarkohet. CDN-ja bie, përdoruesi është offline.
 *     Aplikacioni duhet të punojë edhe pa grafikë.
 *  3. PËRDITËSO, MOS RIKRIJO. Në Javën 11 bënim `chart.destroy()` dhe
 *     `new Chart(...)` pas çdo ndryshimi. Kjo e vret animacionin dhe harxhon
 *     memorie. Më e mirë: ndrysho `chart.data` dhe thirr `chart.update()`.
 * ==========================================================================*/

import { APP, GRADE_LABELS, GRADES } from "../config.js";
import { gradeDistribution } from "../core/statistics.js";
import { $, toggle } from "../ui/dom.js";
import { isDark } from "../ui/theme.js";

/** Ngjyra e secilës notë: 1 e kuqe → 5 e gjelbër. */
const GRADE_COLORS = {
    1: "#e5484d",
    2: "#f5a524",
    3: "#f7c948",
    4: "#3aa675",
    5: "#2f7de1",
};

let barChart = null;
let doughnutChart = null;
let available = false;

/** Ngjyrat e boshtave/legjendës ndryshojnë me temën. */
const themeColors = () =>
    isDark()
        ? { text: "#a8adc0", grid: "rgba(255,255,255,.08)" }
        : { text: "#5c6279", grid: "rgba(16,24,40,.08)" };

/**
 * Krijon të dy grafikët. Thirret NJËHERË nga main.js.
 * @returns {boolean} false nëse Chart.js nuk është i disponueshëm
 */
export function initCharts() {
    // `typeof x === "undefined"` është testi i sigurt për variabla globale
    // që mund të mos ekzistojnë fare (nuk hedh ReferenceError).
    if (typeof Chart === "undefined") {
        console.warn("[charts] Chart.js nuk u ngarkua — po vazhdoj pa grafikë.");
        toggle($("#chartFallback"), true);
        return false;
    }

    const { text, grid } = themeColors();

    Chart.defaults.font.family =
        "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', sans-serif";
    Chart.defaults.color = text;

    /* ------------------------------------------- 1) Shtylla: nota për student */
    barChart = new Chart($("#chartGrades"), {
        type: "bar",
        data: { labels: [], datasets: [{ label: "Nota", data: [], backgroundColor: [], borderRadius: 6, borderWidth: 0 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 350 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        // Personalizim i tooltip-it: tregojmë edhe etiketën e notës.
                        label: (context) =>
                            ` ${context.parsed.y} — ${GRADE_LABELS[context.parsed.y] ?? ""}`,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: GRADES.MAX,
                    ticks: { stepSize: 1, color: text },
                    grid: { color: grid },
                },
                x: {
                    ticks: { color: text, maxRotation: 45, minRotation: 0 },
                    grid: { display: false },
                },
            },
        },
    });

    /* ----------------------------------- 2) Rreth: shpërndarja e notave 1..5 */
    doughnutChart = new Chart($("#chartDistribution"), {
        type: "doughnut",
        data: {
            labels: Object.values(GRADE_LABELS),
            datasets: [
                {
                    data: [],
                    backgroundColor: Object.values(GRADE_COLORS),
                    borderWidth: 2,
                    borderColor: isDark() ? "#171a24" : "#ffffff",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",
            plugins: {
                legend: { position: "bottom", labels: { color: text, boxWidth: 12, padding: 12 } },
            },
        },
    });

    available = true;
    return true;
}

/**
 * Përditëson të dy grafikët nga state-i.
 * Thirret nga app/render.js pas çdo ndryshimi.
 */
export function renderCharts(state) {
    if (!available) return;

    const { students } = state;

    /* Me 200 studentë grafiku do të ishte i palexueshëm. Marrim `chartLimit`
       më të mirët — dhe e THËMË në UI që nuk po fshehim të dhëna. */
    const shown = [...students].sort((a, b) => b.grade - a.grade).slice(0, APP.chartLimit);

    barChart.data.labels = shown.map((student) => student.name.split(" ")[0]);
    barChart.data.datasets[0].data = shown.map((student) => student.grade);
    barChart.data.datasets[0].backgroundColor = shown.map(
        (student) => GRADE_COLORS[student.grade] ?? "#8b90a6"
    );
    barChart.update();

    const note = $("#chartNote");
    if (note) {
        note.textContent =
            students.length > APP.chartLimit
                ? `${APP.chartLimit} më të mirët nga ${students.length}`
                : "";
    }

    const distribution = gradeDistribution(students);
    doughnutChart.data.datasets[0].data = Object.keys(GRADE_LABELS).map(
        (grade) => distribution[grade] ?? 0
    );
    doughnutChart.update();
}

/**
 * Kur përdoruesi ndryshon temën, ngjyrat e teksteve duhet të ndjekin.
 * Chart.js nuk e lexon CSS-in — duhet t'i thuhet me dorë.
 */
export function refreshChartTheme() {
    if (!available) return;

    const { text, grid } = themeColors();

    for (const chart of [barChart, doughnutChart]) {
        chart.options.plugins.legend.labels &&= { ...chart.options.plugins.legend.labels, color: text };
    }

    barChart.options.scales.y.ticks.color = text;
    barChart.options.scales.x.ticks.color = text;
    barChart.options.scales.y.grid.color = grid;

    doughnutChart.data.datasets[0].borderColor = isDark() ? "#171a24" : "#ffffff";

    barChart.update("none");       // "none" = pa animacion
    doughnutChart.update("none");
}

/** Grafikët e mbajnë canvas-in gjallë; pastrimi është pjesë e higjienës. */
export function destroyCharts() {
    barChart?.destroy();
    doughnutChart?.destroy();
    barChart = doughnutChart = null;
    available = false;
}
