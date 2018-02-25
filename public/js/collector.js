import {elementBuilder} from './element';
import {ALL_SELECTOR} from './const';
import {getRecognizedElements} from './helper';

let elements = [];

export function collectElements() {
    elements = [];
    elements.push(...elementBuilder(ALL_SELECTOR));
    console.log(elements);
}

export function getElements() {
    collectElements();
    return elements;
}

export function searchForElements(elementName) {
    collectElements();
    let result = search(elementName);
    if (result.length === 0) {
        return getRecognizedElements(elements, elementName);
    }
    return result;
}

export function search(name) {
    let foundedElements = [];
    let elem;

    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elem = elements[i];
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

function compareStrings(textContent, name) {
    if (!textContent || !name) {
        return false;
    }
    return (textContent.toString().toLowerCase().trim().search(name) >= 0);
}