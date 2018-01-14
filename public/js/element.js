import {CHECK_SELECTORS, CLICK_SELECTORS, FOCUS_SELECTORS, SEARCH_SELECTORS, SELECT_SELECTORS} from "./const";

export function elementBuilder(selector) {
    let elements = [];
    $(selector).each(function () {
        elements.push(buildElement(this));
    });
}

function buildElement(elem) {
    return {
        text: elem.text().trim().toLowerCase(),
        label: getLabel(elem.attr('id')),
        value: hasValueAttribute(elem).trim().toLowerCase(),
        placeholder: hasPlaceholderAttribute(elem).trim().toLowerCase(),
        position: getPosition((label) ? label : elem),
        dimensions: getDimensions((label) ? label : elem),
        type: getTypeOfElement(elem),
    };
}

function getPosition(elem, label) {
    if (label){
        return {
            posLeft: label.offset().left,
            posTop: label.offset().top
        }
    }
    return {
        posLeft: elem.offset().left,
        posTop: elem.offset().top
    };
}

function getDimensions(elem, label) {
    if (label){
        return {
            posLeft: label.outerWidth(true),
            posTop: label.outerHeight(true)
        }
    }
    return {
        posLeft: elem.outerWidth(true),
        posTop: elem.outerHeight(true)
    };
}

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

function hasValueAttribute(element) {
    return((element.value !== undefined || element.value !== '' || element.value !== null )) ? element.value : false;
}

function hasPlaceholderAttribute(element) {
    return (element.placeholder !== undefined || element.placeholder !== '' || element.placeholder !== null ) ? element.placeholder : false;
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