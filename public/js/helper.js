import {
    CLICK_SELECTORS, FOCUS_SELECTORS, CHECK_SELECTORS, SELECT_SELECTORS, SEARCH_SELECTORS, TYPE_FOCUSABLE,
    TYPE_SELECTABLE, TYPE_CLICKABLE, ALL_SELECTOR
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
    /**
     * FIXME: does not work for fixed element, versuche mit position attr
     */
    $('#vocs_wrapper_' + i).width((currentElement.dimensions.width <= 30) ? currentElement.dimensions.width + 10 : currentElement.dimensions.width);
    $('#vocs_wrapper_' + i).outerHeight(currentElement.dimensions.height + 10);
    $('#' + id).offset({top: currentElement.position.posTop - 5, left: currentElement.position.posLeft - 5});
}

export function buildSelectOptionsWrapper(currentElement) {
    const id = generateIdForSelectWrapper(1);
    const div = $('<div>', {class: 'vocs_select_options_container', id: id}).append(
        currentElement.select.option.map( (option, i) =>
                buildLiForSelectOption(i, option)
        ));
    $('.vocs_overlay').append(div);
    $('#' + id).offset({
        top: currentElement.position.posTop + (currentElement.dimensions.height + 10),
        left: currentElement.position.posLeft
    });
}

function buildLiForSelectOption(i, option) {
    return`<li><span>${i + 1}</span>${option}</li>`;
}

export function buildDateTimeMassageContainer(msg, currentElement) {
    const id = generateIdForSelectWrapper(1);
    const divContainer = $('<div>', {class: 'vocs_date_time_container', id: id});
    const divMsg = $('<div>', {class: 'vocs_date_time_msg'});
    const divCurrentValue = $('<div>', {class: 'vocs_date_time_current_value'});

    $(divContainer).append(divCurrentValue);
    $(divContainer).prepend(divMsg);

    $(divMsg).text(msg);
    $(divCurrentValue).text('hui');

    $('.vocs_overlay').append(divContainer);
    $('#' + id).offset({
        top: currentElement.position.posTop - (currentElement.dimensions.height + 80),
        left: currentElement.position.posLeft
    });
}

export function splitUserCommand(userCommand, command) {
    return userCommand.slice((userCommand.indexOf(command) + command.length)).trim();
}

export function extractKeyword(userCommand) {
    let result = userCommand.split(/[ ,]+/);
    if (result[0] === 'delete' || result[0] === 'sleep' || result[0] === 'please' || result[0] === 'keep' || result[0] === 'need'
        || result[0] === 'greek' || result[0] === 'leek' || result[0] === 'lead' || result[0] === 'plague') {
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


export function getRecognizedElements(elements, userCommand) {
    /**
     * TODO: optimize search for long strings with fuzzy
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

export function scrollSelectContainerDown() {
    $('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() + 250}, 'slow');
}
export function scrollSelectContainerUp() {
    $('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() - 250}, 'slow');
}
export function scrollSelectContainerTop() {
    $('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() + 250}, 'slow');
}
export function scrollSelectContainerBottom() {
    $('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() + 250}, 'slow');
}

export function checkNumberInterval(number, max) {
    return (number > 0) && (number <= max);
}