/* ============================================================================
 * data/seed.js  —  Të dhëna shembull
 * MËSIMI: Java 4 — ndarja e TË DHËNAVE nga LOGJIKA
 *
 * Kur të dhënat jetojnë veçmas, mund t'i zëvendësojmë me një API të vërtetë
 * pa prekur asnjë rresht logjike. Kjo është "dependency inversion" në miniaturë.
 * ==========================================================================*/

export const SEED_STUDENTS = [
    { name: "Ardit Krasniqi", age: 21, grade: 5, course: "JavaScript Advanced", email: "ardit.k@example.com" },
    { name: "Erëza Berisha", age: 19, grade: 4, course: "Frontend", email: "ereza.b@example.com" },
    { name: "Blend Gashi", age: 23, grade: 3, course: "Backend", email: "blend.g@example.com" },
    { name: "Drita Hoxha", age: 20, grade: 5, course: "UI/UX Design", email: "drita.h@example.com" },
    { name: "Leart Musliu", age: 22, grade: 2, course: "QA & Testing", email: "leart.m@example.com" },
    { name: "Nita Rexhepi", age: 18, grade: 4, course: "JavaScript Advanced", email: "nita.r@example.com" },
    { name: "Çlirim Dedaj", age: 25, grade: 1, course: "Backend", email: "clirim.d@example.com" },
    { name: "Bardhë Zeka", age: 20, grade: 3, course: "Frontend", email: "bardhe.z@example.com" },
];

/** Citate rezervë, nëse API-ja e citateve nuk përgjigjet (Java 7). */
export const FALLBACK_QUOTES = [
    { quote: "Kodi i lexueshëm është kod i dashur.", author: "7Scantech" },
    { quote: "Debug-imi është si të jesh detektiv në një krim ku ti jeshe fajtori.", author: "Filipe Fortes" },
    { quote: "Së pari bëje të punojë, pastaj bëje të bukur, pastaj bëje të shpejtë.", author: "Kent Beck" },
    { quote: "Programet duhet të shkruhen për njerëzit, e vetëm rastësisht për makinat.", author: "Harold Abelson" },
];
