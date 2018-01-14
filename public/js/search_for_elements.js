/**
 * Buttons
 * */
export function searchForButtons(selector, userInput, round) {

    /**
     * TODO: implement search for elements with span, <i>...
     */

    let foundedElements = [];

    let elem;

    let selectedElements = $(selector);

    if (selectedElements.length > 0) {
        for (let i = 0; i < selectedElements.length; i++) {

            elem = selectedElements[i];

            if (isVisible(elem) && (compareStrings(elem.textContent, userInput, round) || compareStrings(hasValueAttribute(elem, userInput, round)))) {

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

function hasValueAttribute(element) {
    return((element.value !== undefined || element.value !== '' || element.value !== null )) ? element.value : false;
}

function hasPlaceholderAttribute(element) {
    return (element.placeholder !== undefined || element.placeholder !== '' || element.placeholder !== null ) ? element.placeholder : false;
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

/*function hasLabel(element_id, userInput) {
    if(element_id === undefined){
        return false;
    }
    if (getLabel(element_id)){
        return getLabel(element_id).textContent.toLowerCase().trim().startsWith(userInput);
    }
    return (element_id === undefined element.placeholder !== undefined || element.placeholder !== '' || element.placeholder !== null );
}*/

/**
 * Sucht nach dem Label für ein Input - Element, Label muss im 'for' - Attribut über id mit dem zugehörigen Input
 * verknüpft werden, falls ein Input mehrere Labels hat, wird nur Label mit dem Textinhalt berücksichtigt
 * @param element_id - id des zu dem Label zugehörigen Input elements
 * @returns {*} ein Label oder oder false, falls mit dem Input kein Label verknüpft ist
 */
export function getLabel(element_id) {

    let selectedLabels = $('[for=' + element_id + ']');
    //Label gefunden
    if (selectedLabels.length === 1){
        return selectedLabels[0];
    } else if (selectedLabels.length > 1){
        //Element hat mehrere Labels
        for (let i = 0; i < selectedLabels.length; i++) {
            if (selectedLabels[i].textContent.trim().length > 0) {
                return selectedLabels[i];
            }
        }
    }
    return false;
}

function compareStrings(textContent, searchString, round){
    if (!textContent || (searchString === '' || !searchString) || !round){return false;}

    switch (round){
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