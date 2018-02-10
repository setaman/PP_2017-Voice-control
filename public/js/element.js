import {
    CHECK_SELECTORS,
    CLICK_SELECTORS,
    FOCUS_SELECTORS,
    SELECT_SELECTORS,
    TYPE_CLICKABLE,
    TYPE_SELECTABLE,
    TYPE_FOCUSABLE,
    TYPE_DATE_TIME,
    DATE_TIME_SELECTORS
} from "./const";

export function elementBuilder(selector) {
    let elements = [];
    $(selector).each(function () {
        if ((isVisible(this) || isVisible(getLabel(this))) && isInteractive(this)) {
            elements.push(buildElement(this));
        }
    });
    return elements;
}

function buildElement(elem) {
    let currentLabel = getLabel(elem);
    return {
        elem: elem, //HTML - Element
        text: getText(elem), //TEXT - Content
        label: $(currentLabel).text().trim().toLowerCase().replace(/\s{2,}/g, ' '), //LABEL bei Inputs
        value: getValueAttribute(elem), //VALUE - Attribut
        placeholder: getPlaceholderAttribute(elem), //PLACEHOLDER bei Inputfields
        position: getPosition(currentLabel ? currentLabel : elem), //POSITION eines Elements im Browserfenster
        dimensions: getDimensions(currentLabel ? currentLabel : elem), //Dimensionen eines Elements
        type: getTypeOfElement(elem), //TYPE_CLICKABLE, TYPE_FOCUSABLE, TYPE_SELECTABLE oder TYPE_DATE_TIME
        select: {                       //benötigte Daten eines Selects
            option: getOptions(elem), // Optionen
            value: getOptionValue(elem), //Value der Optionen
            selected: getSelectedOption(elem) // selektierte Option
        }
    };
}

/**
 * @param elem - HTML Element
 * @param label - Label, fasll vorhanden
 * @returns {{posLeft: jQuery, posTop: jQuery}} - Abstand des Elements/Labels von linkem und oberen Rand des Fensters
 */
function getPosition(elem, label) {
    if (label) {
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

/**
 * @param elem - HTML Element
 * @param label - Label, falls vorhanden
 * @returns {{width: jQuery, height: jQuery}} - Höhe und Breite des Elements/Labels
 */
function getDimensions(elem, label) {
    if (label) {
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
 * @param elem - HTML - Element
 * @returns {*} ein Label oder oder @undefined, falls mit dem Input kein Label verknüpft ist
 */
export function getLabel(elem) {
    let element_id = $(elem).attr('id');
    let selectedLabels;
    if (element_id) {
        selectedLabels = $('[for=' + element_id + ']');
    }

    if (element_id && selectedLabels && selectedLabels.length > 0) {
        //Label gefunden
        if (selectedLabels.length === 1) {
            return selectedLabels[0];
        } else if (selectedLabels.length > 1) {
            //Element hat mehrere Labels
            for (let i = 0; i < selectedLabels.length; i++) {
                if (selectedLabels[i].textContent.trim().length > 0) {
                    return selectedLabels[i];
                }
            }
        }
    }
/*
    selectedLabels = null;
*/
    selectedLabels = $(elem).prev();
    if ($(selectedLabels).is('label') && selectedLabels.text().trim().length > 0) {
        return selectedLabels[0];
    }
    selectedLabels = null;
    selectedLabels = $(elem).next();
    if ($(selectedLabels).is('label') && selectedLabels.text().trim().length > 0) {
        return selectedLabels[0];
    }
    selectedLabels = null;
    selectedLabels = $(elem).parent('label');
    if ($(selectedLabels).is('label') && selectedLabels.text().trim().length > 0) {
        return selectedLabels[0];
    }
    return undefined;
}

/**
 * Die String werden vereinheitlicht: getrimmt, klein geschieben und alle unnötige Whitespaces entfernt. Gilt füe Alle
 * Strings, die extrahiert werden
 * @param elem - HTML Element
 * @returns {*} Textinhlat des Elements oder @undefined
 */
function getText(elem) {
    if ($(elem).is('select')) {
        return undefined;
    }
    return ($(elem).text()) ? $(elem).text().trim().toLowerCase().replace(/\s{2,}/g, ' ') : undefined;
}

function getValueAttribute(elem) {
    if ($(elem).is('select')) {
        return undefined;
    }
    return (($(elem).val() !== undefined && $(elem).val() !== '' && $(elem).val() !== null)) ? $(elem).val().toString().trim().toLowerCase().replace(/\s{2,}/g, ' ') : undefined;
}

function getPlaceholderAttribute(elem) {
    if ($(elem).is('select')) {
        return undefined;
    }
    return ($(elem).attr('placeholder') !== undefined && $(elem).attr('placeholder') !== '' && $(elem).attr('placeholder') !== null) ? $(elem).attr('placeholder').trim().toLowerCase().replace(/\s{2,}/g, ' ') : undefined;
}

function getOptions(elem) {
    if ($(elem).is('select')) {
        let option = [];

        $(elem).find('option').each(function () {
            option.push($(this).text().trim().toLowerCase().replace(/\s{2,}/g, ' '));
        });
        return ((option.length >= 0) ? option : undefined);
    }
    return undefined;
}

function getSelectedOption(elem) {
    if ($(elem).is('select')) {
        let selected = $(elem).find(':selected').text();
        return (selected ? selected.trim().toLowerCase().replace(/\s{2,}/g, ' ') : undefined)
    }
    return undefined;
}

function getOptionValue(elem) {
    if ($(elem).is('select')) {
        let values = [];

        $(elem).find('option').each(function () {
            values.push($(this).val().trim().toLowerCase().replace(/\s{2,}/g, ' '));
        });
        return ((values.length >= 0) ? values : undefined);
    }
    return undefined;
}

export function getTypeOfElement(element) {
    let clickable = CLICK_SELECTORS + ',' + CHECK_SELECTORS;
    let focusable = FOCUS_SELECTORS /*+ ',' + SEARCH_SELECTORS*/;
    let selectable = SELECT_SELECTORS;
    let dateime = DATE_TIME_SELECTORS;

    let typeC = TYPE_CLICKABLE;
    let typeF = TYPE_FOCUSABLE;
    let typeS = TYPE_SELECTABLE;
    let typeDT = TYPE_DATE_TIME;

    if ($(element).is(clickable)) {
        return typeC;
    } else if ($(element).is(focusable)) {
        return typeF;
    } else if ($(element).is(selectable)) {
        return typeS;
    } else if ($(element).is(dateime)) {
        return typeDT;
    } else {
        return typeC;
    }
}

function isInteractive(elem) {
    return !(elem.disabled || elem.readOnly);
}

function isVisible(elem) {
    if (!(elem instanceof Element)) {
        return false
    }
    try {
        const style = getComputedStyle(elem);
        if (style.display === 'none') return false;
        if (style.visibility !== 'visible') return false;
        if (style.opacity < 0.1) return false;
        if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
            elem.getBoundingClientRect().width === 0) {
            return false;
        }
        const elemCenter = {
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
    } catch (e) {
        console.log(e);
    }
}