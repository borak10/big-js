/* ============================================================================
 * ui/quote.js  —  Citati i ditës
 * MËSIMI: Java 6 (Fetch + async/await) + Java 7 (degradim me hijeshi)
 *
 * Ky është shembulli më i vogël i një cikli të plotë:
 *   gjendje "po ngarkohet" → kërkesë → sukses ose rezervë → vizatim.
 * ==========================================================================*/

import { fetchQuote } from "../services/api.js";
import { $ } from "./dom.js";

export async function loadQuote() {
    const box = $("#quoteBox");
    const textNode = $("#quoteText");
    const authorNode = $("#quoteAuthor");
    if (!box) return;

    box.classList.add("quote--loading");

    // `fetchQuote()` e kap gabimin brenda vetes dhe kthen citat rezervë,
    // prandaj këtu nuk nevojitet try/catch. Kontrata e funksionit është e qartë.
    const { quote, author, source } = await fetchQuote();

    box.classList.remove("quote--loading");
    textNode.textContent = `„${quote}"`;
    authorNode.textContent = `— ${author}${source === "fallback" ? " · (offline)" : ""}`;
    box.dataset.source = source;
}
