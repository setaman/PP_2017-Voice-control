/**
 * Buttons
 * */
export function searchForButtons(selector, userInput) {

    /**
     * TODO: implement search for elements with span, <i>...
     */

    let foundedElements = [];

    let elem;

    let selectedElements = $(selector);

    if (selectedElements.length > 0) {
        for (let i = 0; i < selectedElements.length; i++) {

            elem = selectedElements[i];

            if (isVisible(elem) && (elem.textContent.toLowerCase().trim().startsWith(userInput)
                    || hasValueAttribute(elem, userInput))) {

                if ($(elem).is('li') && $(elem).has('a')) {
                    /*Special logic needed for Tabs*/
                } else {
                    foundedElements.push(elem);
                }
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

            if (isVisible(elem) && (hasLabel(id, userInput) || hasValueAttribute(elem, userInput)
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

/**
 * FIXME: why invisible(in flow) element always selected?
 */
export function isVisible(elem) {
    let top_of_element = $(elem).offset().top;
    let bottom_of_element = $(elem).offset().top + $(elem).outerHeight();
    let bottom_of_screen = $(window).scrollTop() + $(window).height();
    let top_of_screen = $(window).scrollTop();
    return (bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element) && !$(elem).is(':hidden');
}

function hasValueAttribute(element, userInput) {
    if (element.value !== undefined) {
        if (element.value.toString().toLowerCase().trim().startsWith(userInput)) {
            return true;
        }
    }
    return false;
}

function hasPlaceholderAttribute(element, userInput) {
    if (element.placeholder !== undefined) {
        if (element.placeholder.toString().toLowerCase().trim().startsWith(userInput)) {
            return true;
        }
    }
    return false;
}

function hasOption(element, userInput) {
    if ($(element).is('select')) {
        console.log('********Selects content: ' + element.textContent.toString().toLowerCase());
        if (element.textContent.toString().toLowerCase().indexOf(userInput) > 0) {
            return true;
        }
    }
    return false;
}

function hasLabel(element_id, userInput) {
    if(element_id === undefined){
        return false;
    }
    if (getLabel(element_id)){
        return getLabel(element_id).textContent.toLowerCase().trim().startsWith(userInput);
    }
    return false;
}

export function getLabel(element_id) {

    let selectedLabels = $('[for=' + element_id + ']');

    if (selectedLabels.length === 1){
        return selectedLabels[0];
    } else if (selectedLabels.length > 1){
        for (let i = 0; i < selectedLabels.length; i++) {
            if (selectedLabels[i].textContent.trim().length > 0) {
                return selectedLabels[i];
            }
        }
    }
    return false;
}

/**
 * Helper methods
 * **********************************************************************************************************************/