import {CHECK_SELECTORS, CLICK_SELECTORS, FOCUS_SELECTORS, SEARCH_SELECTORS, SELECT_SELECTORS, TYPE_CLICKABLE, TYPE_SELECTABLE, TYPE_FOCUSABLE} from "./const";

export function elementBuilder(selector) {
    let elements = [];
    $(selector).each(function () {
        if ((isVisible(this) || isVisible(getLabel($(this).attr('id')))) && !($(this).is('li') && $(this).has('a'))){
            elements.push(buildElement(this));
        }
    });
    return elements;
}

function buildElement(elem) {
    let currentLabel = getLabel($(elem).attr('id'));
    return {
        elem: elem,
        text: ($(elem).text()) ? $(elem).text().trim().toLowerCase().replace(/\s{2,}/g,' ') : undefined,
        label: $(currentLabel).text().trim().toLowerCase().replace(/\s{2,}/g,' '),
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
            width: $(label).outerWidth(true),
            height: $(label).outerHeight(true)
        }
    }
    return {
        width: $(elem).outerWidth(true),
        height: $(elem).outerHeight(true)
    };
}

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
    return undefined;
}

function hasValueAttribute(elem) {
    return(($(elem).val() !== undefined && $(elem).val() !== '' && $(elem).val() !== null )) ? $(elem).val().toString().trim().toLowerCase().replace(/\s{2,}/g,' ') : undefined;
}

function hasPlaceholderAttribute(elem) {
    return ($(elem).attr('placeholder') !== undefined && $(elem).attr('placeholder') !== '' && $(elem).attr('placeholder') !== null ) ? $(elem).attr('placeholder').trim().toLowerCase().replace(/\s{2,}/g,' ') : undefined;
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

function isVisible(elem) {
    if (!(elem instanceof Element)) {return false}
    try {
        const style = getComputedStyle(elem);
        if (style.display === 'none') return false;
        if (style.visibility !== 'visible') return false;
        if (style.opacity < 0.1) return false;
        if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
            elem.getBoundingClientRect().width === 0) {
            return false;
        }
        const elemCenter   = {
            x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
            y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
        };
        if (elemCenter.x < 0) return false;
        if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
        if (elemCenter.y < 0) return false;
        if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
        let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
        do {
            if (pointContainer === elem) return true;
        } while (pointContainer = pointContainer.parentNode);
        return false;
    }catch (e) {
        console.log(e);
    }

}