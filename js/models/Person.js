/* ============================================================================
 * models/Person.js  —  Klasa bazë
 * MËSIMI: Java 3 — objekte të avancuara, `this`, klasa, konstruktorë,
 *         getters, fusha private (#), metoda, toJSON()
 * ==========================================================================*/

import { titleCase, uid } from "../core/utils.js";

export class Person {
    /**
     * FUSHË PRIVATE (#). Vetëm kodi brenda klasës e lexon.
     * Provoni në console: `student.#id` → SyntaxError. Kjo është enkapsulimi.
     */
    #id;

    /**
     * Konstruktori pranon një OBJEKT dhe e destrukturon (Java 1).
     * Përse objekt e jo `constructor(id, name, age)`?
     *   → `new Person({ name: "Ana", age: 20 })` lexohet vetë,
     *     dhe rendi i argumenteve nuk ka më rëndësi.
     */
    constructor({ id = uid(), name = "", age = 0 } = {}) {
        this.#id = id;
        this.name = titleCase(name);
        this.age = Number(age);
    }

    /** GETTER: përdoret si veti (`person.id`), jo si metodë (`person.id()`). */
    get id() {
        return this.#id;
    }

    /** "Ardit Krasniqi" → "AK". Përdoret për avatarin në listë. */
    get initials() {
        return this.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0].toUpperCase())
            .join("");
    }

    /** Metodë e zakonshme. Klasa bija do t'a MBISHKRUAJË (override). */
    describe() {
        return `${this.name}, ${this.age} vjeç`;
    }

    /**
     * `JSON.stringify(person)` e thërret automatikisht këtë metodë!
     * Pa të, fusha private #id do të humbte gjatë ruajtjes në localStorage.
     */
    toJSON() {
        return { id: this.#id, name: this.name, age: this.age };
    }
}
