/* ============================================================================
 * core/errors.js  —  Klasa gabimesh të personalizuara
 * MËSIMI: Java 3 (klasa, extends, super) + Java 7 (try / catch)
 *
 * PSE klasa gabimesh dhe jo vetëm `throw "gabim"`?
 *   1. `catch (e)` mund të pyesë `e instanceof ValidationError` dhe të reagojë
 *      NDRYSHE për secilin tip gabimi.
 *   2. Mund t'i bashkëngjitim të dhëna shtesë (status, fusha me gabim).
 *   3. Ruajmë `stack trace`-in, që ndihmon në debug (Java 4 & 8).
 * ==========================================================================*/

/** Prindi i të gjithë gabimeve tona. Vini re: extends Error. */
export class AppError extends Error {
    constructor(message, { cause = null, details = null } = {}) {
        super(message);
        // Pa këtë rresht, `error.name` do të ishte "Error" për të gjithë.
        this.name = "AppError";
        this.cause = cause;
        this.details = details;
    }
}

/** Të dhënat e formularit nuk kaluan validimin (Java 9). */
export class ValidationError extends AppError {
    /** @param {Record<string,string>} fields  { name: "mesazhi", age: "..." } */
    constructor(message, fields = {}) {
        super(message, { details: fields });
        this.name = "ValidationError";
        this.fields = fields;
    }
}

/** Diçka shkoi keq me rrjetin ose me serverin (Java 6 & 7). */
export class ApiError extends AppError {
    constructor(message, { status = 0, url = "", cause = null } = {}) {
        super(message, { cause });
        this.name = "ApiError";
        this.status = status;
        this.url = url;
    }

    /** Getter i thjeshtë — sintaksë e Javës 3. */
    get isOffline() {
        return this.status === 0;
    }
}

/** localStorage mund të bllokohet (dritare private, kuota e mbushur). */
export class StorageError extends AppError {
    constructor(message, { cause = null } = {}) {
        super(message, { cause });
        this.name = "StorageError";
    }
}

/**
 * Përkthen ÇDO gabim në një mesazh që një njeri e kupton.
 * Kjo funksion është "ura" mes botës teknike dhe UI-së.
 */
export function describeError(error) {
    if (error instanceof ValidationError) {
        return error.message;
    }
    if (error instanceof ApiError) {
        return error.isOffline
            ? "Nuk arritëm te serveri. A jeni online?"
            : `Serveri u përgjigj me gabim (${error.status}).`;
    }
    if (error instanceof StorageError) {
        return "Nuk mund të shkruajmë në memorien e shfletuesit.";
    }
    if (error instanceof Error) {
        return error.message || "Ndodhi një gabim i papritur.";
    }
    // Dikush bëri `throw "tekst"` — praktikë e keqe, por duhet t'a durojmë.
    return String(error);
}
