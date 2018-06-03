import {elementBuilder} from './element';
import {ALL_SELECTOR} from './const';
import {fuzzySearch} from './fuzzy_search';
//import keywordExtractor from 'keyword-extractor';
import sw from 'stopword';

/*let keywordsExtractorOptions = {
    language:"english",
    remove_digits: true,
    return_changed_case:true,
    remove_duplicates: false
};*/

let elements = [];
let score = 0;

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
    let highestScore = [];

    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elem = elements[i];
            if ((elem.text ? computeScore(elem.text, name) : false)
                || (elem.value ? computeScore(elem.value, name) : false)
                || (elem.placeholder ? computeScore(elem.placeholder, name) : false)
                || (elem.label ? computeScore(elem.label, name) : false)
                || (elem.select.selected ? computeScore(elem.select.selected, name) : false)) {
                elem.score = score;
                highestScore.push(score);
                console.log('Current score:' + score);

                score = 0;
                foundedElements.push(elem);
            }
        }
    }
    if (foundedElements.length === 0) {
        if (elements.length > 0) {
            for (let i = 0; i < elements.length; i++) {
                elem = elements[i];
                if ((elem.text ? computeScore(elem.text, name, true) : false)
                    || (elem.value ? computeScore(elem.value, name, true) : false)
                    || (elem.placeholder ? computeScore(elem.placeholder, name, true) : false)
                    || (elem.label ? computeScore(elem.label, name, true) : false)
                    || (elem.select.selected ? computeScore(elem.select.selected, name, true) : false)) {
                    elem.score = score;
                    highestScore.push(score);
                    console.log('Current score:' + score);
                    score = 0;

                    foundedElements.push(elem);
                }
            }
        }
    }
    highestScore = Math.max(...highestScore);
    for (let i = 0; i < foundedElements.length; i++) {
        elem = foundedElements[i];
        if(elem.score < highestScore) {
            foundedElements.splice(i, 1);
            i--;
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
    return  textContent.toString().toLowerCase().trim().search(name) >= 0 ? 1 : 0;
}

function computeScore(text, userInput, second) {
    let currentScore = 0;
    text = normalizeStringFoSearch(text);
    userInput = normalizeStringFoSearch(userInput);
/*
    console.warn('Text:' + text + ' || Input: ' +  userInput);
    */
    for (let i = 0; i < text.length; i++ ) {
        for (let j = 0; j < userInput.length; j++ ) {
            if (second) {
                if (fuzzySearch(text[i], userInput[j]).length > 0 ) { currentScore += fuzzySearch(text[i], userInput[j]).length; }
            } else {
                if (compareStrings(text[i], userInput[j]) > 0 ) { currentScore += compareStrings(text[i], userInput[j]); }
            }
        }
    }
    score = currentScore;
    return currentScore > 0;
}

function normalizeStringFoSearch(string) {
    string = string.split(/[ ,]+/);
    string = sw.removeStopwords(string, sw.en);
    if (string.length > 0) {
        return string;
    }
    /*let res = keywordExtractor.extract(string,keywordsExtractorOptions);
    if (res.length > 0) {
        return res;
    }*/
    return string;
}