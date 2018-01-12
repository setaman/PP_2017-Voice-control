import {CLICK_SELECTORS, FOCUS_SELECTORS, CHECK_SELECTORS, SELECT_SELECTORS, SEARCH_SELECTORS, TYPE_FOCUSABLE, TYPE_SELECTABLE, TYPE_CLICKABLE} from "./const";
import {isVisible} from './search_for_elements';

export function generateId(i) {
    return 'vocs_multiple_select_wrapper_' + i;
}

export function buildMultipleWrapper(i, currentElement){

    const position = $(currentElement).offset();
    const wrapperWidth = $(currentElement).outerWidth(true);
    const wrapperHeight = $(currentElement).outerHeight(true);

    const id = generateId(i);
    const wrapperTemplate = `<div class="vocs_multiple_select_wrapper_container" id="${id}"><div id="vocs_wrapper_${i}" data-number="${i + 1}" class="vocs_multiple_select_wrapper"></div></div>`;
    $('.vocs_overlay').prepend(wrapperTemplate);
    $('#vocs_wrapper_' + i).width((wrapperWidth <= 100) ? wrapperWidth + 40 : wrapperWidth);
    $('#vocs_wrapper_' + i).outerHeight(wrapperHeight + 10);
    $('#' + id).offset({ top: position.top - 5, left: position.left - 5});

}

export function splitUserCommand(userCommand, command) {
    return userCommand.slice((userCommand.indexOf(command) + command.length)).trim();
}

export function getTypeOfElement(element) {
    let clickable = CLICK_SELECTORS + ',' + CHECK_SELECTORS;
    let focusable = FOCUS_SELECTORS + ',' + SEARCH_SELECTORS;
    let selectable = SELECT_SELECTORS;

    let typeC = TYPE_CLICKABLE;
    let typeF = TYPE_FOCUSABLE;
    let typeS = TYPE_SELECTABLE;

    if ($(element).is(clickable)){
        return typeC;
    } else if ($(element).is(focusable)){
        return typeF;
    } else if ($(element).is(selectable)){
        return typeS;
    }
}

export function collectElementsLabel(selector) {
    let elements = [];
    $(selector).each(function () {
        if (isVisible(this) && !($(this).is('li') && $(this).has('a'))){
            elements.push({label: $(this).text().trim().toLowerCase()});
        }
    });

    return elements;
}