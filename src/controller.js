import $ from 'jquery';
import {
    REG_EXP_CLICK,
    REG_EXP_OFF,
    REG_EXP_CLEAR,
    REG_EXP_DOWN,
    REG_EXP_TOP,
    REG_EXP_BOTTOM,
    REG_EXP_STOP,
    REG_EXP_UP,
    MODE_TYPE,
    MODE_SELECT,
    MODE_NO_MODE,
    STATE_NO_MATCH,
    STATE_MULTIPLE_MATCH,
    MODE_MULTIPLE,
    TYPE_FOCUSABLE, REG_EXP_SHOW, REG_EXP_NUMBER, TYPE_SELECTABLE, TYPE_DATE_TIME, MODE_DATE_TIME, REG_EXP_INFO,
    REG_EXP_DELETE, CLICK,
} from './const';
import {getElements, searchForElements} from './collector';
import {
    scrollUp,
    scrollDown,
    scrollToBottom,
    scrollToTop,
    executeSetText, executeSelection, executeFocus, executeSetDateTime, executeClearText,
    executeDeleteText, executeClearSelection, executeClick
} from './actions';
import {
    buildDateTimeMassageContainer,
    buildMultipleWrapper, buildSelectOptionsWrapper, checkNumberInterval,
    scrollSelectContainerDown,
    scrollSelectContainerUp, setDay, setHour, setMonth, setNumber, setSecondOrMinutes, setWeek, setYear,
    updateDateTimeMsgAndValue
} from "./helper";
import {getRecognizedKeyword, extractElementName} from './analyzer';

import wordsToNumbers from 'words-to-numbers';
import {ui} from './useri';

let currentElements = [],
    currentMultipleElements = [],
    currentInputField,
    currentSelect,
    currentMode = MODE_NO_MODE,
    currentKeyword,
    currentElementName,
    currentDateTime,
    vocsIsActivated = false,
    vocsIswaiting = false;

let day,
    week,
    month,
    year,
    second,
    minute,
    hour,
    number,
    currentValue = '';


//visualize(); //Visualization

let systemState = $('#vocs_text_status'); //UI Ausgabe
let OnRecognition = $('#vocs_text_onrecognition');//UI Ausgabe

//Testing Input
$('#search').click(function () {
    performUserAction($('#search-input').val());
});

/*$('html, body').click(function () {
    changeInputMode(MODE_NO_MODE);
});*/

$('.ti').each(function () {
    $(this).click(function () {
        performUserAction($(this).text());
    })
});

/*******************************************************************************************************************
 * Main function, hier wird die wichtigste Funktionalität abgewickelt
 * @param input - recognized User command
 */
export function performUserAction(input) {

    let t0 = performance.now();

    let userCommand = input.toString().toLowerCase().trim(); //normalise string
    currentKeyword = getRecognizedKeyword(userCommand);//extract keyword
    currentElementName = extractElementName(userCommand, currentKeyword);//extract element name

    //Kontrollausgabe
    console.log('Keyword: ' + currentKeyword + ' || Element name: ' + currentElementName);

    if(vocsIswaiting){
        currentElementName = userCommand;
        currentKeyword = CLICK;
        vocsIswaiting = !vocsIswaiting;
    }

    if (REG_EXP_CLICK.test(currentKeyword) && !currentElementName && !vocsIswaiting) {
        vocsIswaiting = !vocsIswaiting;
        deactivationInterval();
        return;
    }

    //Prüfe, ob STOP eingegeben wurde
    if (currentKeyword && !currentElementName && (REG_EXP_STOP.test(currentKeyword) || REG_EXP_STOP.test(getRecognizedKeyword(currentKeyword)))) {
        stop();
        return;
    }
    //Ablauf nach dem aktuellen Modus, eins der Modi wird ausgeführt, nachdem Ein element mit dem entsprechenden Typ identifiziert wurde
    switch (currentMode) {
        case MODE_NO_MODE: //initial mode
            chooseAction(currentKeyword, currentElementName);//execute some event
            console.log(currentElements);
            //more than one elements identified
            if (currentElements.length > 1) {
                multipleElementsSelected(); //highlight elements
                provideSystemStatus(STATE_MULTIPLE_MATCH, 'Please choose a NUMBER');
                return;
            }
            break;
        case MODE_MULTIPLE: //more than one elements identified, number input required
            try {
                if (!REG_EXP_NUMBER.test(userCommand)) { //check if input is numeric
                    userCommand = wordsToNumbers(userCommand, {fuzzy: true}); //convert - five --> 5
                }
                if (!checkNumberInterval(userCommand, currentMultipleElements.length)) {//Prüfe, ob die Zahl im vorgegebenen Interval liegt
                    provideSystemStatus('Wrong Number', `Number between 1 and ${currentMultipleElements.length}`);
                    return; //Falls nicht, mach nichts
                }
                //Sonst entferne Markierung
                $('.vocs_overlay').remove();//Entferne den Container
                let elem = currentMultipleElements[parseInt(userCommand) - 1];//Gib das entsprechende Element, Position im Array: Eingabe - 1
                handleElement(elem);//entscheide, was mit dem Element gemacht wird
                provideSystemStatus('You choose:', userCommand);
            } catch (e) {
                $('.vocs_overlay').remove();
                console.error('Error im MULTIPLE mode: ' + e);
            }
            currentMultipleElements = [];//lösche die gesamelten Elemente
            break;
        case MODE_TYPE: //Texteingabe Modus
            if (!currentInputField) {
                return; //kein Eingabefeld initialisiert, mach nichts
            }
            if (REG_EXP_CLEAR.test(currentKeyword) && !currentElementName) {
                executeClearText(currentInputField); // CLEAR eingegeben, lösche den gesamten Text
                return;
            }
            if (REG_EXP_DELETE.test(currentKeyword) && !currentElementName) {
                executeDeleteText(currentInputField); // DELETE eingegeben, lösche das letzte Wort
                return;
            }
            if ((currentKeyword && currentElementName) && (currentKeyword === currentElementName) && (REG_EXP_DELETE.test(currentKeyword)
                || REG_EXP_STOP.test(currentKeyword) || REG_EXP_CLEAR.test(currentKeyword))) {
                userCommand = currentKeyword; //STOP, CLEAR, oder DELETE muss dem Eingabefeld als Eingabe hinzugefügt werden
            }
            executeSetText(currentInputField, userCommand); //Texteingabe ausführen
            break;
        case MODE_SELECT: //Optionauswahl Modus
            if (!currentSelect) {
                return;//kein Auswahlmenü initialisiert, mach nichts
            }
            if (REG_EXP_DOWN.test(currentKeyword) || REG_EXP_UP.test(currentKeyword)) {
                chooseAction(currentKeyword, currentElementName); // Auswahlfesnter hoch/runterscrollen
                return;
            }
            if (REG_EXP_CLEAR.test(currentKeyword)) {
                executeClearSelection(currentSelect); //Auswahl aufheben
                return;
            }
            if (!REG_EXP_NUMBER.test(userCommand)) { //Prüfe, ob die Zahl in numerischer Form ist
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
            }
            if (!checkNumberInterval(userCommand, currentSelect.select.value.length)) {
                return;
            }
            try {
                executeSelection(currentSelect, currentSelect.select.value[parseInt(userCommand) - 1]); //Option auswählen
                $('.vocs_overlay').remove(); //Container entfernen
            } catch (e) {
                console.log(e);
                $('.vocs_overlay').remove();
            }
            stop();
            break;
        case MODE_DATE_TIME: //Datums-Zeiteingabe Modus
            if (!currentDateTime && !userCommand) {
                return; // Eingabefeld nicht initialisiert
            }
            //Komplette Eingabe Entfernen
            if (REG_EXP_CLEAR.test(currentKeyword) && !currentElementName) {
                $('.vocs_overlay').remove(); //Container entfernen
                clearDateTimeValues(); // eingegebene Daten löschen
                executeClearText(currentDateTime); // Eingabe im Eingabefeld entfernen
                handleDateTime(currentDateTime, undefined); // Die Eigabe neu beginnen
                return;
            }
            if (!REG_EXP_NUMBER.test(userCommand)) {//Prüfe, ob die Zahl in numerischer Form ist
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
            }
            try {
                handleDateTime(currentDateTime, userCommand); //Eingabe fortzetzen
                return;
            } catch (e) {
                console.warn(e);
            }
            stop();
            break;
        default:
            stop(); // entferne Daten des aktuellen Ablaufs
            break;
    }
    clearCurrentElements();
    let t1 = performance.now();
    console.log('Execution time: ' + (t1 - t0) + ' mil');
    console.log('CurrentElements on end: ');
    console.log(currentElements);
    console.log(currentMultipleElements);
}

/**
 * Main function end
 ******************************************************************************************************************/

/**
 * Hier werden Elemente gesamelt oder ein bestimmtes Event wird ausgeführt
 * @param keyword - das erkannte Keyword
 * @param elementName - der erkannte Elementname
 */
function chooseAction(keyword, elementName) {
    if (keyword && currentElementName) {
        if (REG_EXP_CLICK.test(keyword)) {
            currentElements.push(...searchForElements(elementName));
            if (currentElements.length === 1) {
                handleElement(currentElements[0]);
            } else if (currentElements.length === 0) {
                provideSystemStatus(STATE_NO_MATCH, 'Please try again');
                console.error('-------------No element found------------------');
            }
            vocsIsActivated = true;
            deactivationInterval();
        }
    }else if (keyword && !elementName) { // Keyword isoliert als einzelnes Wort eingegeben
        switch (true) {
            case REG_EXP_CLICK.test(keyword):
                vocsIsActivated = !vocsIsActivated;
                ui.statusClickActivated();
                break;
            case REG_EXP_DOWN.test(keyword):
                if (currentSelect) {
                    scrollSelectContainerDown(); //Auswahlmenü-Fenster runterscrollen
                } else {
                    scrollDown();//Browserfenster runterscrollen
                }
                break;
            case REG_EXP_UP.test(keyword):
                if (currentSelect) {
                    scrollSelectContainerUp();//Auswahlmenü-Fenster hochscrollen
                } else {
                    scrollUp();//Browserfenster hochscrollen
                }
                break;
            case REG_EXP_TOP.test(keyword):
                scrollToTop(); //Browserfenster zum Anfang scrollen
                break;
            case REG_EXP_BOTTOM.test(keyword):
                scrollToBottom(); //Browserfenster zum Ende scrollen
                break;
            case REG_EXP_SHOW.test(keyword):
                currentElements.push(...getElements()); //Sammle alle steuerbaren Elemente
                break;
            case REG_EXP_OFF.test(keyword):
                /**
                 * TODO: implement this
                 */
                break;
            case REG_EXP_INFO.test(keyword):
            /**
             * TODO: implement this(not relevant)
             */
            default:
        }
    }
}

/**
 *Anhand des Elementttypes wird bestimmte Logik ausgeführt
 * @param elem - im elemet.js erstelltes Element-Objekt
 */
function handleElement(elem) {
    if (elem.type === TYPE_FOCUSABLE) {
        setInputField(elem); //Texteingabefeld
    } else if (elem.type === TYPE_SELECTABLE) {
        setCustomSelectContainer(elem); //Auswahlmenü
    } else if (elem.type === TYPE_DATE_TIME) {
        handleDateTime(elem); //Datums-, Zeit- oder Zahleingabefeld
    } else { //Eine Schaltfläche (diverse Buttons und Links)
        executeClick(elem); //direkt wird ein Click-Event ausgeführt
        changeInputMode(MODE_NO_MODE);
    }
}

/**
 * Texteingabefeld wird initialisiert
 * @param elem - im elemet.js erstelltes Element-Objekt
 */
function setInputField(elem) {
    currentInputField = elem; //Texteingabefeld global initialisieren
    changeInputMode(MODE_TYPE); // Modus --> MODE_TYPE
    executeFocus(elem); //Focus-Event ausführen
}

/**
 * Auswahlmenü wird initialisiert und Auswahlfenster wird erstellt
 * @param elem - im elemet.js erstelltes Element-Objekt
 */
function setCustomSelectContainer(elem) {
    $('body').prepend('<div class="vocs_overlay"></div>'); //Container der Webseite hinzufügen
    buildSelectOptionsWrapper(elem); //Fenster mit Optionen erstellen
    currentSelect = elem; //Auswahlmenü global initialisieren
    changeInputMode(MODE_SELECT); // Modus --> MODE_SELECT
    elem.elem.focus(); //Select fokussieren
}

/**
 * Mehrere Elemente wurden identifiziert und werden mit einer Zahl markiert
 */
function multipleElementsSelected() {
    $('body').prepend('<div class="vocs_overlay"></div>'); //Container hinzufügen
    //Alle Elemente im Array werden markiert
    for (let i = 0; i < currentElements.length; i++) {
        if (currentElements[i].label) {//FIXME: why do i do this???
            buildMultipleWrapper(i, currentElements[i]);
        } else {
            buildMultipleWrapper(i, currentElements[i]);
        }
        changeInputMode(MODE_MULTIPLE);
        currentMultipleElements.push(currentElements[i]);
    }
}

/**
 * Hier wird das Fenster für Eingabe der Zeit/Zahl/Datums erstellt und mit Daten gefüllt
 * @param elem - im elemet.js erstelltes Element-Objekt
 * @param msg - Ausgabe im Fenster (was soll der Benutzer als Nächstes eingeben)
 * @param currentValue - aktuell eingegebene Daten, zur Kontrolle
 */
function setDateTime(elem, msg, currentValue) {
    $('body').prepend('<div class="vocs_overlay"></div>'); // Container erstellen
    changeInputMode(MODE_DATE_TIME);
    buildDateTimeMassageContainer(elem, msg, currentValue); // Fenster erstellen
    currentDateTime = elem; // Eingabefeld initialisieren
}

/**
 * Eingabe der Datum un der Uhrzeiten/Zahlen, für unterschiedliche Input-Typen ist untr. Logik vorgesehen, die Daten werden nacheinander
 * gefüllt und in dem value-Attribut hinzugefügt
 * @param elem - im elemet.js erstelltes Element-Objekt
 * @param input - Benutzereingabe, undefined in der ersten Runde, dann muss eine Zahl sein
 */
function handleDateTime(elem, input) {
    let value,
        newValue,
        type;
    if (input) {
        //DO not convert to int here, because can't set '0' before number
        value = input.toString().trim().toLowerCase();
    }
    type = elem.elem.type;
    elem.elem.focus();
    //Für jeden Input werden unterschiedliche Daten eingegeben
    switch (type) {
        case 'datetime-local':
            //Wenn @input undefined ist, bedeutes es, dass es die Erste runde ist und das Fenster wird erstellt
            if (!value) {
                setDateTime(elem, 'Set DAY', currentValue); //Erstelle Fenster
                return;
            }
            if (!day) { //Tag wurde noch nicht eingegeben
                day = setDay(value); //prüfen und setze die Eingabe
                if (day) {
                    currentValue += 'D' + day;
                    updateDateTimeMsgAndValue('Set MOTH', currentValue); //updatete die Ausgabe im Fenster
                    newValue = '0001-01-' + day + 'T01:01:01'; //@value muss immer in einer vom Inputtyp abhängiger Form eingegeben
                    $(elem.elem).val(newValue); //setze die Eingabe im Inutfeld
                } else {
                    updateDateTimeMsgAndValue('Set DAY', 'Please provide valid value');// nicht valide Eingabe
                }
                return;
            }
            if (!month) {//Monat noch nicht eingegeben, setze Monat
                month = setMonth(value);
                if (month) {
                    currentValue += ' M' + month;
                    updateDateTimeMsgAndValue('Set YEAR', currentValue);
                    newValue = '0001-' + +month + '-' + day + 'T01:01:01';
                    $(elem.elem).val(newValue);
                } else {
                    updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                }
                return;
            }
            if (!year) {//Jahr noch nicht eingegeben, setze Jahr usw. usw....
                year = setYear(value);
                if (year) {
                    currentValue += ' Y' + year;
                    updateDateTimeMsgAndValue('Set SECOND', currentValue);
                    newValue = year + '-' + month + '-' + day + 'T01:01:01';
                    $(elem.elem).val(newValue);
                } else {
                    updateDateTimeMsgAndValue('Set YEAR', 'Please provide valid value');
                }
                return;
            }
            if (!second) {
                second = setSecondOrMinutes(value);
                if (second) {
                    currentValue += ' S' + second;
                    updateDateTimeMsgAndValue('Set MINUTE', currentValue);
                    newValue = year + '-' + month + '-' + day + 'T01:01:' + second;
                    $(elem.elem).val(newValue);
                } else {
                    updateDateTimeMsgAndValue('Set SECOND', 'Please provide valid value');
                }
                return;
            }
            if (!minute) {
                minute = setSecondOrMinutes(value);
                if (minute) {
                    currentValue += ' M' + minute;
                    updateDateTimeMsgAndValue('Set HOUR', currentValue);
                    newValue = year + '-' + month + '-' + day + 'T01:' + minute + ':' + second;
                    $(elem.elem).val(newValue);
                } else {
                    updateDateTimeMsgAndValue('Set MINUTE', 'Please provide valid value');
                }
                return;
            }
            if (!hour) {
                hour = setHour(value);
                if (hour) {
                    currentValue += ' H' + hour;
                    newValue = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;
                    try {
                        executeSetDateTime(currentDateTime, newValue);
                        changeInputMode(MODE_NO_MODE);
                    } catch (e) {
                        console.error('Can not set value: ' + newValue);
                    }
                } else {
                    updateDateTimeMsgAndValue('Set HOUR', 'Please provide valid value');
                }
            }
            break;
        case 'time':
            if (!value) {
                setDateTime(elem, 'Set MINUTE', currentValue);
                return;
            }
            if (!minute) {
                minute = setSecondOrMinutes(value);
                if (minute) {
                    currentValue += ' M' + minute;
                    updateDateTimeMsgAndValue('Set HOUR', currentValue);
                } else {
                    updateDateTimeMsgAndValue('Set MINUTE', 'Please provide valid value');
                }
                return;
            }
            if (!hour) {
                hour = setHour(value);
                if (hour) {
                    newValue = hour + ':' + minute;
                    try {
                        executeSetDateTime(currentDateTime, newValue);
                        changeInputMode(MODE_NO_MODE);
                    } catch (e) {
                        console.error('Can not set value: ' + newValue);
                    }
                } else {
                    updateDateTimeMsgAndValue('Set HOUR', 'Please provide valid value');
                }
            }

            break;
        case 'week':
            if (!value) {
                setDateTime(elem, 'Set WEEK', currentValue);
                return;
            }
            if (!week) {
                week = setWeek(value);
                if (week) {
                    currentValue += ' W' + week;
                    updateDateTimeMsgAndValue('Set YEAR', currentValue);
                } else {
                    updateDateTimeMsgAndValue('Set WEEK', 'Please provide valid value');
                }
                return;
            }
            if (!year) {
                year = setYear(value);
                if (year) {
                    newValue = year + '-W' + week;
                    try {
                        executeSetDateTime(currentDateTime, newValue);
                        changeInputMode(MODE_NO_MODE);
                    } catch (e) {
                        console.error('Can not set value: ' + newValue);
                    }
                } else {
                    updateDateTimeMsgAndValue('Set HOUR', 'Please provide valid value');
                }
            }
            break;
        case 'date':
            if (!value) {
                setDateTime(elem, 'Set DAY', currentValue);
                return;
            }
            if (!day) {
                day = setDay(value);
                if (day) {
                    currentValue += 'D' + day;
                    updateDateTimeMsgAndValue('Set MONTH', currentValue);
                } else {
                    updateDateTimeMsgAndValue('Set DAY', 'Please provide valid value');
                }
                return;
            }
            if (!month) {
                month = setMonth(value);
                if (month) {
                    currentValue += ' M' + month;
                    updateDateTimeMsgAndValue('Set YEAR', currentValue);
                } else {
                    updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                }
                return;
            }
            if (!year) {
                year = setYear(value);
                if (year) {
                    newValue = year + '-' + month + '-' + day;
                    try {
                        executeSetDateTime(currentDateTime, newValue);
                        changeInputMode(MODE_NO_MODE);
                    } catch (e) {
                        console.error('Can not set value: ' + newValue);
                    }
                } else {
                    updateDateTimeMsgAndValue('Set YEAR', 'Please provide valid value');
                }
                return;
            }
            break;
        case 'month':
            if (!value) {
                setDateTime(elem, 'Set MONTH', currentValue);
                return;
            }
            if (!month) {
                month = setMonth(value);
                if (month) {
                    currentValue += ' M' + month;
                    updateDateTimeMsgAndValue('Set YEAR', currentValue);
                } else {
                    updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                }
                return;
            }
            if (!year) {
                year = setYear(value);
                if (year) {
                    newValue = year + '-' + month;
                    try {
                        executeSetDateTime(currentDateTime, newValue);
                        changeInputMode(MODE_NO_MODE);
                    } catch (e) {
                        console.error('Can not set value: ' + newValue);
                    }
                } else {
                    updateDateTimeMsgAndValue('Set YEAR', 'Please provide valid value');
                }
                return;
            }
            break;
        case 'number':
            if (!value) {
                setDateTime(elem, 'Set NUMBER', currentValue);
                return;
            }
            if (!number) {
                number = setNumber(currentDateTime, value);
                if (number) {
                    newValue = number;
                    try {
                        executeSetDateTime(currentDateTime, newValue);
                        changeInputMode(MODE_NO_MODE);
                    } catch (e) {
                        console.error('Can not set value: ' + newValue);
                    }
                } else {
                    updateDateTimeMsgAndValue('Set NUMBER', 'Please provide valid value');
                }
                return;
            }
            break;
        default:
            console.warn('type: ' + type);
    }
}

/**
 * Ausgabe im UI anzeigen (alpha)
 * @param state - Systemzustand
 * @param textOnRecognition - Ausgabetext
 */
export function provideSystemStatus(state, textOnRecognition) {
    if (textOnRecognition.length > 35) {
        let limitedRecognitionText = textOnRecognition.slice(textOnRecognition.length - 35, textOnRecognition.length);
        $(OnRecognition).text(limitedRecognitionText);
    } else {
        $(OnRecognition).text(textOnRecognition);
    }
    $(systemState).text(state);
}

/*function clearUI() {
    setTimeout(function () {
        $(OnRecognition).text('');
        $(systemState).text('Say something');
        console.log('Reset UI');
    }, 5000);

}*/

function clearCurrentElements() {
    clearDateTimeValues();
    currentElements = [];
    currentKeyword = undefined;
}

/**
 * Moduswechsel
 * @param newInputMode - neuer Modus
 */
function changeInputMode(newInputMode) {
    currentMode = newInputMode;
    if (currentMode === MODE_NO_MODE) {
        $('.vocs_overlay').remove();//Container entfernen
        if (currentInputField) {
            currentInputField.elem.blur();//Focus aufheben
            currentInputField = null;//aktuelles Element löschen
        }
        if (currentDateTime) {
            currentDateTime.elem.blur();
            currentDateTime = null;
        }
        if (currentSelect) {
            currentSelect.elem.blur();
            currentSelect = null;
        }
    }
}

/**
 * Datum/Zeit/Zahl -Eingaben löschen
 */
function clearDateTimeValues() {
    day = undefined;
    week = undefined;
    month = undefined;
    year = undefined;
    second = undefined;
    minute = undefined;
    hour = undefined;
    currentValue = '';
}

function deactivationInterval() {
    let i = 0;
    let interval = setInterval( () => {
        i += 1;
        if (i === 20 && (vocsIsActivated || vocsIswaiting)) {
            if (vocsIswaiting) {vocsIswaiting = !vocsIswaiting;}
            vocsIsActivated = !vocsIsActivated;
            console.error('!!!VOCS deactivated!!!');
        } else if (!vocsIsActivated) {
            i = 0;
            clearInterval(interval);
        }
    }, 500)
}

function stop() {
    changeInputMode(MODE_NO_MODE);
    clearCurrentElements();
    currentMultipleElements = [];
    console.log('------Current MODE------: ' + currentMode);
}