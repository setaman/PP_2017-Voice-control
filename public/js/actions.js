import {TYPE_FOCUSABLE, TYPE_SELECTABLE, TYPE_CLICKABLE} from "./const";

/**
 * FIXME: element durch allgemeines Element ersetzen
 */
export function executeAction(element) {
    let typeC = TYPE_CLICKABLE;
    let typeF = TYPE_FOCUSABLE;
    let typeS = TYPE_SELECTABLE;

    console.log(element);

    if (element.type === typeC) {
        executeClick(element);
    } else if (element.type === typeF) {
        executeFocus(element);
    } else if (element.type === typeS) {
        executeSelect(element);
    } else {
        executeClick(element)
    }
}

/**
 * TODO: wrap actions with "try catch"
 */
export function executeClick(element) {
    element.elem.click();
    element.elem.focus();
}

export function executeFocus(element) {
    element.elem.focus();
}

export function executeSetText(elem, text) {
    try {
        let currentTextContent = $(elem.elem).val();
        let currentTextLength = currentTextContent.trim().length;
        let maxTextLength = elem.elem.maxLength;

        if (currentTextLength === 0) {
            if (maxTextLength > -1) {
                currentTextContent += text.slice(0, maxTextLength - currentTextLength);
            } else {
                currentTextContent += text
            }
        } else {
            if (maxTextLength > -1) {
                if (currentTextLength < maxTextLength){
                    currentTextContent += ' ' + text.slice(0, (maxTextLength - (currentTextLength + 1)));
                }
            } else {
                currentTextContent += ' ' + text;
            }
        }
        $(elem.elem).val(currentTextContent);
    } catch (e) {
        console.error('Error in executeSetText(): ' + e);
    }

}

export function executeSelect(element, value) {
    $(element.elem).find(`option[value=${value}]`).prop('selected', true);
    $(element.elem).focus();
}

export function scrollDown() {
    $('html, body').animate({
        scrollTop: $(window).scrollTop() + (window.innerHeight * 0.7)
    });
}

export function scrollUp() {
    $('html, body').animate({
        scrollTop: $(window).scrollTop() - (window.innerHeight * 0.7)
    });
}

export function scrollToTop() {
    $('html, body').animate({scrollTop: 0}, 'slow');
}

export function scrollToBottom() {
    $('html, body').animate({scrollTop: $(document).height()}, 1000);
}