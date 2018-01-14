import {CHECK_SELECTORS, CLICK_SELECTORS, FOCUS_SELECTORS, SEARCH_SELECTORS, SELECT_SELECTORS, TYPE_CLICKABLE, TYPE_SELECTABLE, TYPE_FOCUSABLE} from "./const";
import {isVisible} from "./search_for_elements";

export function elementBuilder(selector) {
    let elements = [];
    $(selector).each(function () {
        if (isVisible(this)){
            elements.push(buildElement($(this)));
        }
    });
    return elements;
}

function buildElement(elem) {
    let currentLabel = getLabel(elem.attr('id'));
    return {
        text: (elem.text()) ? elem.text().trim().toLowerCase().replace(/\s{2,}/g,' ') : undefined,
        label: $(currentLabel).text().trim().toLowerCase().replace(/\s/g,' '),
        value: hasValueAttribute(elem),
        placeholder: hasPlaceholderAttribute(elem),
        position: getPosition(currentLabel ? currentLabel : elem),
        dimensions: getDimensions(currentLabel ? currentLabel : elem),
        type: getTypeOfElement(elem),
    };
}

function getPosition(elem, label) {
    if (label){
        return {
            posLeft: $(label).offset().left,
            posTop: $(label).offset().top
        }
    }
    return {
        posLeft: $(elem).offset().left,
        posTop: $(elem).offset().top
    };
}

function getDimensions(elem, label) {
    if (label){
        return {
            posLeft: $(label).outerWidth(true),
            posTop: $(label).outerHeight(true)
        }
    }
    return {
        posLeft: $(elem).outerWidth(true),
        posTop: $(elem).outerHeight(true)
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
    return undefined;
}

function hasValueAttribute(element) {
    return((element.val() !== undefined && element.val() !== '' && element.val() !== null )) ? element.val().toString().trim().toLowerCase().replace(/\s\s/g,' ') : undefined;
}

function hasPlaceholderAttribute(element) {
    return (element.attr('placeholder') !== undefined && element.attr('placeholder') !== '' && element.attr('placeholder') !== null ) ? element.attr('placeholder').trim().toLowerCase().replace(/\s\s/g,' ') : undefined;
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