import {elementBuilder} from './element';
import {ALL_SELECTORS} from './const';
import {getRecognizedElements} from './helper';

let elements = [];

export function collectElements() {
    elements = [];
    elements.push(...elementBuilder(ALL_SELECTORS,));
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

/**
 * Buttons
 * */
export function search(userInput) {
    let foundedElements = [];

    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            if (compareStrings(elements[i].text, userInput) /*|| (elements[i].value ? compareStrings(elements[i].value, userInput) : false)*/
                || (elements[i].placeholder ? compareStrings(elements[i].placeholder, userInput) : false)
                || (elements[i].label ? compareStrings(elements[i].label, userInput) : false)
                || compareStrings(elements[i].select.selected, userInput)) {

                foundedElements.push(elements[i]);
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