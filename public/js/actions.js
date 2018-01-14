import {getTypeOfElement} from "./helper";
import {TYPE_FOCUSABLE, TYPE_SELECTABLE, TYPE_CLICKABLE} from "./const";


export function executeAction(element) {

    console.log($(element));
    let typeC = TYPE_CLICKABLE;
    let typeF = TYPE_FOCUSABLE;
    let typeS = TYPE_SELECTABLE;

    if (getTypeOfElement(element) === typeC){
        executeClick($(element));
    } else if (getTypeOfElement(element) === typeF){
        executeFocus($(element));
    } else if (getTypeOfElement(element) === typeS){
        executeSelect($(element));
    }
}

/**
 * TODO: wrap actions with "try catch"
 */
export function executeClick(element) {
    element.trigger('click');
    element.focus();

}

export function executeCheck(element) {
    element.click();
    element.focus();
}

export function executeFocus(element) {
    element.focus();
    element.click();
}

export function executeSetText(element, text) {
    console.log('---------Typing text......: ' + text);

    let currentTextContent = $(element).val();

    if (currentTextContent.trim().length === 0) {
        currentTextContent += text;
    } else {
        currentTextContent += ' ' + text;
    }
    $(element).val(currentTextContent);
}

export function executeSelect(element) {
    $(element).focus();
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
    $("html, body").animate({scrollTop: 0}, "slow");
}

export function scrollToBottom() {
    $("html, body").animate({scrollTop: $(document).height()}, 1000);
}