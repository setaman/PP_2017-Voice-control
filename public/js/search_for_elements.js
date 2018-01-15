import {elementBuilder} from './element';
import {ALL_SELECTORS} from './const';
import {getRecognizedLabel} from './helper';

let elements = [];

export function collectElements() {
    elements = [];
    elements.push(...elementBuilder(ALL_SELECTORS,));
    console.log(elements);
}

export function searchForElements(userInput) {
    let result = search(userInput);
    if (result.length === 0) {
        return getRecognizedLabel(elements, userInput);
    }
    return result;
}

/**
 * Buttons
 * */
export function search(userInput, round) {
    let foundedElements = [];

    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            if (compareStrings(elements[i].text, userInput, round) || (elements[i].value ? compareStrings(elements[i].value, userInput, round) : false)
                || (elements[i].placeholder ? compareStrings(elements[i].placeholder, userInput, round) : false)
                || (elements[i].label ? compareStrings(elements[i].label, userInput, round) : false)) {

                foundedElements.push(elements[i]);
            }
        }
    }
    return foundedElements
}

/**
 * INPUTS
 * */
export function searchForInputFields(selector, userInput) {

    /**
     * TODO: find input with text, but without label
     */

    let foundedElements = [];

    let selectedElements = $(selector);

    let elem;

    if (selectedElements.length > 0) {

        for (let i = 0; i < selectedElements.length; i++) {

            elem = selectedElements[i];
            let id = $(elem).attr('id');

            if (isVisible(elem) && (/*hasLabel(id, userInput)*/ hasValueAttribute(elem, userInput)
                    || hasPlaceholderAttribute(elem, userInput))) {
                foundedElements.push(elem);
            }
        }
    }

    return foundedElements;
}

/**
 * CHECKS
 * */
export function searchForCheckboxesAndRadios(selector, userInput) {

    let foundedElements = [];

    let elem;

    let selectedElements = $(selector);

    if (selectedElements.length > 0) {
        for (let i = 0; i < selectedElements.length; i++) {

            elem = selectedElements[i];
            let label = getLabel($(elem).attr('id'));

            if (isVisible(label) && label.textContent.toLowerCase().trim().startsWith(userInput)) {
                foundedElements.push(elem);
            }
        }
    }
    return foundedElements;
}

/**
 * SELECT
 * */
export function searchForSelect(selector, userInput) {

    let foundedElements = [];

    let elem;

    let selectedElements = $(selector);

    if (selectedElements.length > 0) {
        for (let i = 0; i < selectedElements.length; i++) {

            elem = selectedElements[i];

            if (/*isVisible(elem) && */(elem.textContent.toLowerCase().trim().startsWith(userInput) || hasOption(elem, userInput))) {
                console.log('Select found: ' + elem.textContent);
                foundedElements.push(elem);
            }
        }
    }

    return foundedElements;
}

/************************************************************************************************************************
 * Helper methods
 */
function hasOption(element, userInput) {
    if ($(element).is('select')) {
        console.log('********Selects content: ' + element.textContent.toString().toLowerCase());
        if (element.textContent.toString().toLowerCase().indexOf(userInput) > 0) {
            return true;
        }
    }
    return false;
}

function compareStrings(textContent, searchString, round) {
    if (!textContent || (searchString === '' || !searchString) || !round) {
        return false;
    }

    switch (3) {
        case 1:
            return textContent.toString().toLowerCase().trim() === searchString;
        case 2:
            return textContent.toString().toLowerCase().trim().startsWith(searchString);
        case 3:
            return (textContent.toString().toLowerCase().trim().search(searchString) >= 0);
        default:
            return false;
    }
}

/**
 * Helper methods
 * ********************************************************************************************************************/