import {elementBuilder} from './element';
import {ALL_SELECTOR} from './const';
import {getRecognizedElements} from './helper';

let elements = [];

export function collectElements() {
    elements = [];
    elements.push(...elementBuilder(ALL_SELECTOR,));
    console.log(elements);
}

export function getElements() {
    collectElements();
    return elements;
}

export function searchForElements(userInput) {
    collectElements();
    let result = search(userInput);
    if (result.length === 0) {
        return getRecognizedElements(elements, userInput);
    }
    return result;
}

export function search(userInput) {
    let foundedElements = [];
    let elem;

    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elem = elements[i];
            if (compareStrings(elem.text, userInput) || (elem.value ? compareStrings(elem.value, userInput) : false)
                || (elem.placeholder ? compareStrings(elem.placeholder, userInput) : false)
                || (elem.label ? compareStrings(elem.label, userInput) : false)
                || compareStrings(elem.select.selected, userInput)) {

                foundedElements.push(elem);
            }
        }
    }
    return foundedElements
}

/************************************************************************************************************************
 * Helper methods
 */

function compareStrings(textContent, searchString) {
    if (!textContent || !searchString) {
        return false;
    }
    return (textContent.toString().toLowerCase().trim().search(searchString) >= 0);
}

/**
 * Helper methods
 * ********************************************************************************************************************/