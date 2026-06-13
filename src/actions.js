import $ from 'jquery';
import {TYPE_FOCUSABLE, TYPE_SELECTABLE, TYPE_CLICKABLE} from "./const";


/************************************************************
 * Hier werden die EVENTS für Einzelne Elemente Ausgeführt***
 ***********************************************************/


//FIXME: is this function required?
/**
 * anhand des Elementtyps wird bestimmtes Event ausgeführt
 * @param element - Element-Objekt
 */
export function executeAction(element) {
    //FIXME: why this initialization is needed
    let typeC = TYPE_CLICKABLE;
    let typeF = TYPE_FOCUSABLE;
    let typeS = TYPE_SELECTABLE;

    console.log(element);

    if (element.type === typeC) {
        executeClick(element);
    } else if (element.type === typeF) {
        executeFocus(element);
    } else if (element.type === typeS) {
        executeSelection(element);
    } else {
        executeClick(element)
    }
}

//TODO: wrap actions with "try catch"
/**
 * CLICK-EVENT
 */
export function executeClick(element) {
    element.elem.click();
    element.elem.focus();
}
/**
 * FOCUS-EVENT
 */
export function executeFocus(element) {
    element.elem.focus();
}
/**
 * Text wird eingegeben, Die Länge der Eingabe wird auf den im 'maxLength'-Attribut (falls vorhanden) definierten Wert begrenzt
 */
export function executeSetText(elem, text) {
    try {
        let currentTextContent = $(elem.elem).val();
        let currentTextLength = currentTextContent.trim().length;
        let maxTextLength = elem.elem.maxLength;

        if (currentTextLength === 0) {
            if (maxTextLength > -1) {// maximale Länge begrenzt und Eingabefeld ist leer
                currentTextContent += text.slice(0, maxTextLength - currentTextLength);
            } else {
                currentTextContent += text;// maximale Länge nicht begrenzt und Eingabefeld ist leer
            }
        } else {
            if (maxTextLength > -1) {// maximale Länge begrenzt und Eingabefeld hat bereits Text
                if (currentTextLength < maxTextLength){
                    currentTextContent += ' ' + text.slice(0, (maxTextLength - (currentTextLength + 1)));
                }
            } else {
                currentTextContent += ' ' + text;// maximale Länge nicht begrenzt und Eingabefeld hat bereits Text
            }
        }
        $(elem.elem).val(currentTextContent);//Text einfügen
    } catch (e) {
        console.error('Error in executeSetText(): ' + e);
    }

}

/**
 * Eingabefeld leeren
 */
export function executeClearText(elem) {
    if (!elem){return;}
    let el = $(elem.elem);
    if (el.val() && el.val() !== ''){
        el.val(null);
    }
}

/**
 * Letztes Wort im Eingabefeld wird gelöscht
 */
export function executeDeleteText(elem) {
    let el = $(elem.elem);
    let currentText = el.val();
    if (currentText && currentText !== ''){
        let temp = currentText.split(/[ ,]+/);
        el.val(currentText.slice(0, - (temp[temp.length - 1].length + 1)));//hier habe ich was tolles implementiert
    }
}

/**
 * Option selectieren
 * @param value - 'value' - Wert
 */
export function executeSelection(element, value) {
    //FIXME: does not work for values with characters like "()"
    $(element.elem).find(`option[value=${value}]`).prop('selected', true);
}

export function executeClearSelection(elem) {
    //TODO: implement this
}

export function executeDeleteSelection(elem) {
    //TODO: implement this
}

/**
 * Datum/Zeit/Zahl setzen
 */
export function executeSetDateTime(elem, value) {
    $(elem.elem).val(value);
}

/**
 * Fenster runterscrollen
 */
export function scrollDown() {
    $('html, body').animate({
        scrollTop: $(window).scrollTop() + (window.innerHeight * 0.6)
    });
}

/**
 * Fenster hochscrollen
 */
export function scrollUp() {
    $('html, body').animate({
        scrollTop: $(window).scrollTop() - (window.innerHeight * 0.6)
    });
}

/**
 * Fenster zum Anfang scrollen
 */
export function scrollToTop() {
    $('html, body').animate({scrollTop: 0}, 'slow');
}

/**
 * Fenster zum Ende scrollen
 */
export function scrollToBottom() {
    $('html, body').animate({scrollTop: $(document).height()}, 1000);
}