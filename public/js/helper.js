import {
    CLICK_SELECTORS, FOCUS_SELECTORS, CHECK_SELECTORS, SELECT_SELECTORS, SEARCH_SELECTORS, TYPE_FOCUSABLE,
    TYPE_SELECTABLE, TYPE_CLICKABLE, ALL_SELECTORS
} from "./const";
import {isVisible} from './search_for_elements';
import {fuzzySearchForElements} from "./fuzzy_search";

function generateId(i) {
    return 'vocs_multiple_select_wrapper_' + i;
}

export function generateIdForSelectWrapper(i) {
    return 'vocs_select_options_container_' + i;
}

export function buildMultipleWrapper(i, currentElement) {
    const id = generateId(i);
    const wrapperTemplate = `<div class="vocs_multiple_select_wrapper_container" id="${id}"><div id="vocs_wrapper_${i}" data-number="${i + 1}" class="vocs_multiple_select_wrapper"></div></div>`;
    $('.vocs_overlay').append(wrapperTemplate);
    $('#vocs_wrapper_' + i).width((currentElement.dimensions.width <= 30) ? currentElement.dimensions.width + 10 : currentElement.dimensions.width);
    $('#vocs_wrapper_' + i).outerHeight(currentElement.dimensions.height + 10);
    $('#' + id).offset({top: currentElement.position.posTop - 5, left: currentElement.position.posLeft - 5});
}

export function buildSelectOptionsWrapper(currentElement) {
    const id = generateIdForSelectWrapper(1);
    const ul = $('<div>', {class: 'vocs_select_options_container'}).append(
        currentElement.select.option.map(option =>
            $('<li>', {class: 'vocs_select_options_container', id: generateId(option)}).text(option))
    );

    $('.vocs_overlay').append(ul);
    $('#' + id).offset({
        top: currentElement.position.posTop + (currentElement.dimensions.height + 10),
        left: currentElement.position.posLeft
    });
}


export function splitUserCommand(userCommand, command) {
    return userCommand.slice((userCommand.indexOf(command) + command.length)).trim();
}

export function extractKeyword(userCommand) {
    let result = userCommand.split(/[ ,]+/);
    if (result[0] === 'delete' || result[0] === 'sleep' || result[0] === 'please' || result[0] === 'keep' || result[0] === 'need') {
        return 'click';
    }
    return result[0];
}

export function extractSearchString(userCommand) {
    let result = userCommand.split(/[ ,]+/);
    if (result.length > 1) {
        result = userCommand.match(/^(\S+)\s(.*)/).slice(1);
        return (result.length > 1) ? result[1] : undefined;
    }
    return undefined;
}

export function getTypeOfElement(element) {
    let clickable = CLICK_SELECTORS + ',' + CHECK_SELECTORS;
    let focusable = FOCUS_SELECTORS + ',' + SEARCH_SELECTORS;
    let selectable = SELECT_SELECTORS;

    let typeC = TYPE_CLICKABLE;
    let typeF = TYPE_FOCUSABLE;
    let typeS = TYPE_SELECTABLE;

    if ($(element).is(clickable)) {
        return typeC;
    } else if ($(element).is(focusable)) {
        return typeF;
    } else if ($(element).is(selectable)) {
        return typeS;
    }
}

export function getRecognizedElements(elements, userCommand) {

    /**
     * TODO: optimize search for long strings
     */

    /*let result = userCommand.match(/^(\S+)\s(.*)/).slice(1);*/

    let fuzzy_result = fuzzySearchForElements(elements, userCommand);
    if (fuzzy_result !== undefined && fuzzy_result.length > 0) {
        console.log('FUZZY found:');
        console.log(fuzzy_result);
        return fuzzy_result;
    }
    return [];
}