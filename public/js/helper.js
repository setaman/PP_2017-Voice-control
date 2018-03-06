import {KEYWORDS_OBJECTS} from "./const";
import {fuzzySearchForElements, fuzzySearchForKeywords} from "./fuzzy_search";

function generateId(i) {
    return 'vocs_multiple_select_wrapper_' + i;
}

export function generateIdForSelectWrapper(i) {
    return 'vocs_select_options_container_' + i;
}

/**
 * Markierung der Elemente
 * @param i - Arrayposition
 * @param currentElement - Element-Objekt
 */
export function buildMultipleWrapper(i, currentElement) {
    const id = generateId(i);
    //Markierungscontainer wird erstellt (Styling, Positionierung der angezeigten Zahl usw.)
    const wrapperTemplate = `<div class="vocs_multiple_select_wrapper_container" id="${id}"><div id="vocs_wrapper_${i}" data-number="${i + 1}" class="vocs_multiple_select_wrapper"></div></div>`;
    $('.vocs_overlay').append(wrapperTemplate);//Die Markierung wird dem obersten Container hinzugefügt
    //Abmessungen werden entsprechend dem markierten Element gesetzt
    $('#vocs_wrapper_' + i).width((currentElement.dimensions.width <= 30) ? currentElement.dimensions.width + 10 : currentElement.dimensions.width);
    $('#vocs_wrapper_' + i).outerHeight(currentElement.dimensions.height);
    //FIXME: fix height position for wrapper
    //FIXME: on scroll does not work properly for fixed elements
    //Position der Markierung an der Postion des markierten Elements festlegen
    $('#' + id).offset({top: currentElement.position.posTop - 5, left: currentElement.position.posLeft - 5});
}

/**
 * Auswahlfenster für Auswahlmenüs wird erstellt
 * @param elem - Element-Objekt
 */
export function buildSelectOptionsWrapper(elem) {
    const id = generateIdForSelectWrapper(1);
    //Fenster erstellen
    const div = $('<div>', {class: 'vocs_select_options_container', id: id}).append(
        elem.select.option.map((option, i) =>
            buildLiForSelectOption(i, option) //die einzelnen mit einer Zahl markierten Elemente werden dem Fenster hinzugefügt
        ));
    $('.vocs_overlay').append(div);//das Fesnter dem Container
    //Position unter dem Select festlegen
    $('#' + id).offset({
        top: elem.position.posTop + (elem.dimensions.height + 10),
        left: elem.position.posLeft
    });
}

/**
 * Optionen erstellen
 * @param i - position im Array von Optionen eines Selects
 * @param option - Text der Option
 * @return {string} - HTML-Element
 */
function buildLiForSelectOption(i, option) {
    return `<li><span>${i + 1}</span>${option}</li>`;
}

/**
 * Datum/Zeit/Zahl - Eingabefenster
 * @param currentElement - Element-Objekt
 * @param msg - Ausgabe für den Benutzer (was soll er eingeben)
 * @param currentValue - aktuell gemachten Eingaben
 */
export function buildDateTimeMassageContainer(currentElement, msg, currentValue) {
    const id = generateIdForSelectWrapper(1);
    const divContainer = $('<div>', {class: 'vocs_date_time_container', id: id});//Fenster
    const divMsg = $('<div>', {class: 'vocs_date_time_msg'}); //Ausgabe
    const divCurrentValue = $('<div>', {class: 'vocs_date_time_current_value'});//Kontrollausgabe
    //Ausgabe- und Kontrollfenster werden dem gesamten Fenster hintzugefügt
    $(divContainer).append(divCurrentValue);
    $(divContainer).prepend(divMsg);
    //Ausgabetext wird gesetzt
    $(divMsg).text(msg);
    $(divCurrentValue).text(currentValue);
    //Fenster dem obersten Container hinzufügen
    $('.vocs_overlay').append(divContainer);
    //Position über dem Element festlegen
    $('#' + id).offset({
        top: currentElement.position.posTop - (currentElement.dimensions.height + 80),
        left: currentElement.position.posLeft
    });
}

/**
 * Fenster wird mit neuen Daten aktualisiert
 */
export function updateDateTimeMsgAndValue(msg, currentValue) {
    $('.vocs_date_time_msg').text(msg);
    $('.vocs_date_time_current_value').text(currentValue);
}

/**
 * Elementname wird aus der Benutzereingabe extrahiert
 * @param userCommand - Benutzereingabe
 * @return {*} - Elementname oder undefined
 */
export function extractElementName(userCommand) {
    /*if (keyword !== KEYWORDS_OBJECTS[0].keyword) {return undefined;}//'click' nicht verwendet*/
    let result = userCommand.split(/[ ,]+/); //Eingabe bei Leerzeichen splitten, //-> [click, awesome, select]
    if (result.length > 1) {
        result = userCommand.match(/^(\S+)\s(.*)/).slice(1); //->[click, awesome select]
        return (result.length > 1) ? result[1] : undefined; //awesome select
    }
    return undefined;
}

/*function splitUserCommand(userCommand, keyword) {
    return userCommand.slice((userCommand.indexOf(keyword) + keyword.length)).trim();
}*/

/**
 * Keyword wird aus der Benutzereingabe extrahiert
 * @param userCommand - Benutzereingabe
 * @return {*} - Keyword oder undefined
 */
export function getRecognizedKeyword(userCommand) {
    let keyword = extractKeyword(userCommand); //extrahiere Keyword
    $.each(KEYWORDS_OBJECTS, (index, value) => {
        if (value.regExp.test(keyword)) {
            //Keyword von der SE Software richtig erkannt
            return keyword;
        }
    });
    //Sonst Keyword vermuten, aunscharfe Suche
    try {
        let result = fuzzySearchForKeywords(KEYWORDS_OBJECTS, keyword);
        if (result && result.length > 0) {
            return result[0]; // berechnetes Keyword
        }
        return undefined;// kein Keyword identifiziert
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

/**
 * Keyword wird extrahiert
 */
function extractKeyword(userCommand) {
    let result = userCommand.split(/[ ,]+/); // String bei Leerzeichen splitten, erzeugt [click, select];
    //Just for better results hardcoded
    if (result[0] === 'sleep' || result[0] === 'please' || result[0] === 'keep' || result[0] === 'need'
        || result[0] === 'greek' || result[0] === 'leek' || result[0] === 'lead' || result[0] === 'plague') {
        return 'click';
    }
    return result[0]; //click
}

/**
 * Unscharfe Suche nach einem Element
 * @param elements - Array von Element-Objekten
 * @param name - Elementname
 * @return {*} - berechnete Elemente
 */
export function getRecognizedElements(elements, name) {
    /**
     * TODO: optimize search for long strings with fuzzy
     */
    let fuzzy_result = fuzzySearchForElements(elements, name);//unscharfe Suche
    if (fuzzy_result !== undefined && fuzzy_result.length > 0) {
        console.log('FUZZY found:');
        console.log(fuzzy_result);
        return fuzzy_result;
    }
    return [];
}

/**
 * Auswahlfenster srcollen (down)
 */
export function scrollSelectContainerDown() {
    $('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() + 250}, 'slow');
}
/**
 * Auswahlfenster srcollen (up)
 */
export function scrollSelectContainerUp() {
    $('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() - 250}, 'slow');
}
//TODO: implement this
export function scrollSelectContainerTop() {
    //$('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() + 250}, 'slow');
}
//TODO: implement this
export function scrollSelectContainerBottom() {
    //$('.vocs_select_options_container').animate({scrollTop: $('.vocs_select_options_container').scrollTop() + 250}, 'slow');
}

export function checkNumberInterval(number, max) {
    return (number > 0) && (number <= max);
}
//Folgende Methoden validieren die Datum/Zeit/Zahl eingaben und normalisieren die Darstellung
export function setDay(day) {
    if (!checkNumberInterval(parseInt(day), 31)) {
        return undefined;
    }
    if (day.length === 1) {
        day = '0' + day;
    }
    return day;
}

export function setWeek(week) {
    if (!checkNumberInterval(parseInt(week), 53)) {
        return undefined;
    }
    if (week.length === 1) {
        week = '0' + week;
    }
    return week;
}

export function setMonth(month) {
    if (!checkNumberInterval(parseInt(month), 12)) {
        return undefined;
    }
    if (month.length === 1) {
        month = '0' + month;
    }
    return month;
}

export function setYear(year) {
    if (!checkNumberInterval(parseInt(year), 5000)) {
        return undefined;
    }
    if (year.length === 1) {
        year = '000' + year;
    } else if (year.length === 2) {
        year = '00' + year;
    } else if (year.length === 3) {
        year = '0' + year;
    }
    return year;
}

export function setSecondOrMinutes(value) {
    if (!checkNumberInterval(parseInt(value), 59)) {
        return undefined;
    }
    if (value.length === 1) {
        value = '0' + value;
    }
    return value;
}

export function setHour(hour) {
    if (!checkNumberInterval(parseInt(hour), 23)) {
        return undefined;
    }
    if (hour.length === 1) {
        hour = '0' + hour;
    }
    return hour;
}

export function setNumber(elem, number) {
    let el = elem.elem;
    let min, max;

    if (el.min) {
        min = parseInt(el.min);
    }
    if (el.max) {
        max = parseInt(el.max);
    }

    if (min && !max) {
        if (number < min) {
            return undefined;
        }
    }
    if (min && max) {
        if (number < min || number > max) {
            return undefined;
        }
    }
    if (!min && max) {
        if (number > max) {
            return undefined;
        }
    }

    return number;
}