import {elementBuilder} from './element';
import {ALL_SELECTOR} from './const';
import {getRecognizedElements} from './helper';
import {fuzzySearch} from './fuzzy_search';
import keywordExtractor from 'keyword-extractor';

let keywordsExtractorOptions = {
    language:"english",
    remove_digits: true,
    return_changed_case:true,
    remove_duplicates: false
};

let elements = [];

/**
 * Elemente werden zur weiteren Aussortierung gesammelt
 */
export function collectElements() {
    //reset array
    elements = [];
    //create custom Element-Objects
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
    //collect Elements
    collectElements();
    //search for needed element
    let result = search(elementName);
    /*if (result.length === 0) {
        //no Element found, try with fuzzy search
        return getRecognizedElements(elements, elementName);
    }*/
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
            if ((elem.text ? computeScore(elem.text, name) : false)
                || (elem.value ? computeScore(elem.value, name) : false)
                || (elem.placeholder ? computeScore(elem.placeholder, name) : false)
                || (elem.label ? computeScore(elem.label, name) : false)
                || (elem.select.selected ? computeScore(elem.select.selected, name) : false)) {

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
    return  1 ? (textContent.toString().toLowerCase().trim().search(name) >= 0) : 0;
}

function computeScore(text, userInput) {
    let score = 0;
    text = normalizeStringFoSearch(text);
    userInput = normalizeStringFoSearch(userInput);
    console.warn('Text:' + text + ' || Input: ' +  userInput);

    for (let i = 0; i < text.length; i++ ) {
        for (let j = 0; j < userInput.length; j++ ) {
            if (fuzzySearch(text[i], userInput[j]).length > 0 ) { score += fuzzySearch(text[i], userInput[j]).length; }
            //if (compareStrings(text[i], userInput[j]) > 0 ) { score += compareStrings(text[i], userInput[j]); }
        }
        console.log('Current score for:' + text[i] + ' is ' + score);
    }
    return score > 0;
}

function normalizeStringFoSearch(string) {
    let res = keywordExtractor.extract(string,keywordsExtractorOptions);
    if (res.length > 0) {
        return res;
    }
    return string.split(/[ ,]+/);
}