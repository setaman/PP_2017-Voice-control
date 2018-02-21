/**
 * Created by Pastuh on 19.10.2017.
 */
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
    REG_EXP_DELETE,
} from './const';
import {getElements, searchForElements} from './collector';
import {
    scrollUp,
    scrollDown,
    scrollToBottom,
    scrollToTop,
    executeSetText, executeAction, executeSelect, executeFocus, executeSetDateTime, executeClearText, executeDeleteText
} from './actions';
import {
    buildDateTimeMassageContainer,
    buildMultipleWrapper, buildSelectOptionsWrapper, checkNumberInterval, extractKeyword, extractElementName,
    scrollSelectContainerDown,
    scrollSelectContainerUp, setDay, setHour, setMonth, setNumber, setSecondOrMinutes, setWeek, setYear,
    updateDateTimeMsgAndValue,
    getRecognizedKeyword
} from "./helper";
import {fuzzySearchForKeywords} from "./fuzzy_search";

import 'jquery-ui-dist/jquery-ui.min'
import wordsToNumbers from 'words-to-numbers';
//import '../css/vocs_styles.css'
import speechRecognition from './visualizer';

let currentElements = [],
    currentMultipleElements = [],
    currentInputField,
    currentInput,
    currentSelect,
    currentMode = MODE_NO_MODE,
    currentKeyword,
    currentElementName,
    currentDateTime;

let day,
    week,
    month,
    year,
    second,
    minute,
    hour,
    number,
    currentValue = '';


//speechRecognition();

let systemState = $('#vocs_text_status');
let OnRecognition = $('#vocs_text_onrecognition');

$('#search').click(function () {
    performUserAction($('#search-input').val());
});

$('#hide').click(function () {
    $('.select_').click();
});

/*$('html, body').click(function () {
    changeInputMode(MODE_NO_MODE);
});*/

/*******************************************************************************************************************
 * Main function
 * @param input - recognized User command
 */
export function performUserAction(input) {

    let t0 = performance.now();

    let userCommand = input.toString().toLowerCase().trim(); //normalisiere den String

    currentKeyword = getRecognizedKeyword(userCommand);
    currentElementName = extractElementName(userCommand, currentKeyword);

    console.log('Keyword: ' + currentKeyword + ' || Search String: ' + ((currentElementName !== '') ? currentElementName : 'no search string'));

    if (currentKeyword && !currentElementName && (REG_EXP_STOP.test(currentKeyword) || REG_EXP_STOP.test(getRecognizedKeyword(currentKeyword)))) {
        changeInputMode(MODE_NO_MODE);
        return;
    }

    switch (currentMode) {
        case MODE_NO_MODE:
            if (!currentKeyword) {
                return;
            }
            choiceAction(currentKeyword, currentElementName);

            if (currentElements.length > 1) {
                multipleElementsSelected();
                provideSystemStatus(STATE_MULTIPLE_MATCH, 'Please choose a NUMBER');
            }
            console.log(currentElements);
            break;
        case MODE_MULTIPLE:
            try {
                if (!REG_EXP_NUMBER.test(userCommand)) {
                    userCommand = wordsToNumbers(userCommand, {fuzzy: true});
                }
                if (!checkNumberInterval(userCommand, currentMultipleElements.length)) {
                    return;
                }
                $('.vocs_overlay').remove();
                let elem = currentMultipleElements[parseInt(userCommand) - 1];
                handleElement(elem);
                currentMultipleElements = [];
                provideSystemStatus('You choose:', userCommand);

            } catch (e) {
                $('.vocs_overlay').remove();
                console.error('Error im MULTIPLE mode: ' + e);
            }
            break;
        case MODE_TYPE:
            if (!currentInputField) {
                return;
            }
            if (REG_EXP_CLEAR.test(currentKeyword) && !currentElementName) {
                executeClearText(currentInputField);
                return;
            }
            if (REG_EXP_DELETE.test(currentKeyword) && !currentElementName) {
                executeDeleteText(currentInputField);
                return;
            }
            if((currentKeyword && currentElementName) && (currentKeyword === currentElementName)){
                userCommand = currentKeyword;
            }
            executeSetText(currentInputField, userCommand);
            break;
        case MODE_SELECT:
            if (!currentSelect) {
                return;
            }
            if (REG_EXP_DOWN.test(currentKeyword) || REG_EXP_UP.test(currentKeyword)) {
                choiceAction(currentKeyword,
                    currentElementName);
                return;
            }
            if (!REG_EXP_NUMBER.test(userCommand)) {
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
            }
            if (!checkNumberInterval(userCommand, currentSelect.select.value.length)) {
                return;
            }
            try {
                executeSelect(currentSelect, currentSelect.select.value[parseInt(userCommand) - 1]);
                changeInputMode(MODE_NO_MODE);
                $('.vocs_overlay').remove();
            } catch (e) {
                console.log(e);
                $('.vocs_overlay').remove();
            }
            break;
        case MODE_DATE_TIME:
            if (!currentDateTime && !userCommand) {
                return;
            }
            if (REG_EXP_CLEAR.test(currentKeyword) && !currentElementName) {
                $('.vocs_overlay').remove();
                clearDateTimeValues();
                executeClearText(currentDateTime);
                handleDateTime(currentDateTime, undefined);
                return;
            }
            if (!REG_EXP_NUMBER.test(userCommand)) {
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
            }
            try {
                if (!REG_EXP_NUMBER.test(userCommand)) {
                    return;
                }
                handleDateTime(currentDateTime, userCommand);
                return;
            } catch (e) {
                console.warn(e);
            }
            break;
        default:
            clearCurrentElements();
            break;
    }
    clearCurrentElements();
    let t1 = performance.now();
    console.log('Execution time: ' + (t1 - t0) + ' mil');
}

/**
 * Main function end
 ******************************************************************************************************************/

function choiceAction(keyword, userCommand) {
    if (keyword && userCommand) {
        if (REG_EXP_CLICK.test(keyword)) {
            currentElements.push(...searchForElements(userCommand));
            if (currentElements.length === 1) {
                handleElement(currentElements[0]);
            } else if (currentElements.length === 0) {
                provideSystemStatus(STATE_NO_MATCH, 'Please try again');
                console.error('-------------No element found------------------');

            }
        }
    } else if (keyword && !userCommand) {
        switch (true) {
            case REG_EXP_DOWN.test(keyword):
                if (currentSelect) {
                    scrollSelectContainerDown();
                } else {
                    scrollDown();
                }
                break;
            case REG_EXP_UP.test(keyword):
                if (currentSelect) {
                    scrollSelectContainerUp();
                } else {
                    scrollUp();
                }
                break;
            case REG_EXP_TOP.test(keyword):
                scrollToTop();
                break;
            case REG_EXP_BOTTOM.test(keyword):
                scrollToBottom();
                break;
            case REG_EXP_SHOW.test(keyword):
                currentElements.push(...getElements());
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

//Entscheide was mit dem @elem passieren muss
function handleElement(elem) {
    if (elem.type === TYPE_FOCUSABLE) {
        setInputField(elem);
    } else if (elem.type === TYPE_SELECTABLE) {
        setCustomSelectContainer(elem);
    } else if (elem.type === TYPE_DATE_TIME) {
        handleDateTime(elem);
    } else {
        executeAction(elem);
        changeInputMode(MODE_NO_MODE);
    }
}

function setInputField(elem) {
    currentInputField = elem;
    changeInputMode(MODE_TYPE);
    executeFocus(elem);
}

function setCustomSelectContainer(elem) {
    $('body').prepend('<div class="vocs_overlay"></div>');
    buildSelectOptionsWrapper(elem);
    currentSelect = elem;
    changeInputMode(MODE_SELECT);
}

function multipleElementsSelected() {
    $('body').prepend('<div class="vocs_overlay"></div>');
    for (let i = 0; i < currentElements.length; i++) {
        if (currentElements[i].label) {
            buildMultipleWrapper(i, currentElements[i]);
        } else {
            buildMultipleWrapper(i, currentElements[i]);
        }
        changeInputMode(MODE_MULTIPLE);
        currentMultipleElements.push(currentElements[i]);
    }
}

function setDateTime(elem, msg, currentValue) {
    $('body').prepend('<div class="vocs_overlay"></div>');
    changeInputMode(MODE_DATE_TIME);
    buildDateTimeMassageContainer(elem, msg, currentValue);
    currentDateTime = elem;
}

/**
 * Eingabe der Datum un der Uhrzeit, für unterschiedliche Input-Typen ist untr. Logik nötig, die Daten werden nacheinander
 * gefüllt und in dem value-Attribut hinzugefügt
 * @param elem - HTML - Element, <input type="date time week...">
 * @param input - Benutzereingabe, undefined in der ersten Runde, dann muss eine Zahl sein
 */
function handleDateTime(elem, input) {
    console.error('current value: ' + input);
    let value,
        newValue,
        type;
    if (input) {
        //DO not convert to int here, because can't set '0' before number
        value = input.toString().trim().toLowerCase();
    }
    type = elem.elem.type;
    elem.elem.focus();

    switch (type) {
        case 'datetime-local':
            console.warn('type: ' + type);
            if (!value) {
                setDateTime(elem, 'Set DAY', currentValue);
                return;
            }
            if (!day) {
                day = setDay(value);
                if (day) {
                    currentValue += 'D' + day;
                    updateDateTimeMsgAndValue('Set MOTH', currentValue);
                    newValue = '0001-01-' + day + 'T01:01:01';
                    $(elem.elem).val(newValue);
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
                    newValue = '0001-' + +month + '-' + day + 'T01:01:01';
                    $(elem.elem).val(newValue);
                } else {
                    updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                }
                return;
            }
            if (!year) {
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

export function provideSystemStatus(state, textOnRecognition) {
    if (textOnRecognition.length > 35) {
        let limitedRecognitionText = textOnRecognition.slice(textOnRecognition.length - 35, textOnRecognition.length);
        $(OnRecognition).text(limitedRecognitionText);
    } else {
        $(OnRecognition).text(textOnRecognition);
    }
    $(systemState).text(state);
}

function clearUI() {
    setTimeout(function () {
        $(OnRecognition).text('');
        $(systemState).text('Say something');
        console.log('Reset UI');
    }, 5000);

}

function clearCurrentElements() {
    clearDateTimeValues();
    currentElements = [];
    currentKeyword = undefined;
}

function changeInputMode(newInputMode) {
    currentMode = newInputMode;
    if (currentMode === MODE_NO_MODE) {
        $('.vocs_overlay').remove();
        if (currentInputField) {
            currentInputField.elem.blur();
            currentInputField = null;
            currentInput = null;
        }
        if (currentDateTime) {
            currentDateTime.elem.blur();
            currentDateTime = null;
        }
        currentSelect = null;
        clearCurrentElements();
    }
    console.log('------Current MODE------: ' + currentMode);
}

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

