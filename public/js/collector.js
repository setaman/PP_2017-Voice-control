import {elementBuilder} from './element';
import {ALL_SELECTOR} from './const';
import {getRecognizedElements} from './helper';

let elements = [];

/**
 * Elemente werden zur weiteren Aussortierung gesammelt
 */
export function collectElements() {
    elements = [];
    //Benutzerdefinierte Element-Objekte werden erzeugt
    elements.push(...elementBuilder(ALL_SELECTOR));
    console.log(elements);
}

/**
 * Elemente werden für 'show'-Befehl gesammelt
 * @returns {Array} - Array von Element-Objekten
 */
export function getElements() {
    collectElements();
    return elements;
}

/**
 * Suche nach Elementen, die den den Elementnamen enthalten
 * @param elementName - der vom Benutzer eingegebene Elementname
 * @returns {Array} - identifizierte Element-Objekte
 */
export function searchForElements(elementName) {
    //Elemente sammeln
    collectElements();
    //Nach einem Element suchen
    let result = search(elementName);
    if (result.length === 0) {
        //Kein Element identifiziert, verwende fuzzy search
        return getRecognizedElements(elements, elementName);
    }
    return result;
}

/**
 * Suche nach einem Element
 * @param name - Elementname
 * @returns {Array} - identifizierte Element-Objekte
 */
export function search(name) {
    let foundedElements = [];
    let elem;

    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elem = elements[i];
            //FIXME: why compareStrings(elem.text, name) ?
            if (compareStrings(elem.text, name)
                || (elem.value ? compareStrings(elem.value, name) : false)
                || (elem.placeholder ? compareStrings(elem.placeholder, name) : false)
                || (elem.label ? compareStrings(elem.label, name) : false)
                || compareStrings(elem.select.selected, name)) {

                foundedElements.push(elem);
            }
        }
    }
    return foundedElements;
}

/**
 * Prüfe, on der übergebene Name in der Objekt-Eigenschaft enthalten ist
 */
function compareStrings(textContent, name) {
    if (!textContent || !name) {
        return false;
    }
    return (textContent.toString().toLowerCase().trim().search(name) >= 0);
}