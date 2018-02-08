/**
 * Created by Pastuh on 19.10.2017.
 */
import {
    REG_EXP_CLICK,
    REG_EXP_OFF,
    REG_EXP_SEARCH,
    REG_EXP_CLEAR,
    REG_EXP_SCROLL_DOWN,
    REG_EXP_SCROLL_TO_TOP,
    REG_EXP_SCROLL_TO_BOTTOM,
    REG_EXP_STOP,
    REG_EXP_SCROLL_UP,
    MODE_TYPE,
    MODE_SELECT,
    MODE_NO_MODE,
    STATE_LISTENING,
    STATE_ERROR,
    STATE_YOU_SAY,
    STATE_NO_MATCH,
    STATE_ACTIVE,
    STATE_INACTIVE,
    STATE_MULTIPLE_MATCH,
    MODE_MULTIPLE,
    TYPE_FOCUSABLE,
    KEYWORDS_OBJECTS, REG_EXP_SHOW, SHOW, CLEAR, REG_EXP_NUMBER, TYPE_SELECTABLE, TYPE_DATE_TIME, MODE_DATE_TIME,
} from './const';
import {getElements, searchForElements} from './collector';
import {
    scrollUp,
    scrollDown,
    scrollToBottom,
    scrollToTop,
    executeSetText, executeAction, executeSelect, executeFocus, executeSetDateTime, executeClearText
} from './actions';
import {
    buildDateTimeMassageContainer,
    buildMultipleWrapper, buildSelectOptionsWrapper, checkNumberInterval, extractKeyword, extractSearchString,
    scrollSelectContainerDown,
    scrollSelectContainerUp, setDay, setHour, setMonth, setNumber, setSecondOrMinutes, setWeek, setYear,
    updateDateTimeMsgAndValue
} from "./helper";
import {fuzzySearchForKeywords} from "./fuzzy_search";

import 'jquery-ui-dist/jquery-ui.min'
import wordsToNumbers from 'words-to-numbers';
//import '../css/vocs_styles.css'
import speechRecognition from './visualizer';

let currentElements = [],
    currentMultipleElements = [],
    currentInputfield,
    currentSelect,
    currentMode = MODE_NO_MODE,
    systemRecognitionState = false,
    currentKeyword,
    currentSearchString,
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


window.onload = function () {

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
    function performUserAction(input) {

        $('#hide').click(function () {
            alert($('.select_').attr('id'));
        });

        let t0 = performance.now();

        let userCommand = input.toString().toLowerCase().trim();

        currentKeyword = getRecognizedKeyword(extractKeyword(userCommand));
        currentSearchString = extractSearchString(userCommand);
        console.log('Keyword: ' + currentKeyword + ' || Search String: ' + ((currentSearchString !== '') ? currentSearchString : 'no search string'));

        if (currentKeyword && (REG_EXP_STOP.test(currentKeyword) || REG_EXP_STOP.test(getRecognizedKeyword(currentKeyword)))) {
            changeInputMode(MODE_NO_MODE);
            return;
        }

        if (currentMode === MODE_MULTIPLE) {
            try {
                if (!REG_EXP_NUMBER.test(userCommand)) {
                    userCommand = wordsToNumbers(userCommand, {fuzzy: true});
                }
                if (!checkNumberInterval(userCommand, currentMultipleElements.length)){return;}
                $('.vocs_overlay').remove();
                let elem = currentMultipleElements[parseInt(userCommand) - 1];
                handleElement(elem);
                currentMultipleElements = [];
                provideSystemStatus('You choose:', userCommand);

            } catch (e) {
                console.error('Error im MULTIPLE mode: ' + e);
            }
            return;
        }

        if (currentMode === MODE_NO_MODE && currentKeyword) {

            choiceAction(currentKeyword, currentSearchString);

            if (currentSearchString || currentKeyword === SHOW) {
                if (currentElements.length === 0) {
                    provideSystemStatus(STATE_NO_MATCH, 'Please try again');
                    console.error('-------------No element found------------------');

                } else if (currentElements.length > 1) {
                    multipleElementsSelected();
                    provideSystemStatus(STATE_MULTIPLE_MATCH, 'Please choose a NUMBER');
                }
                console.log(currentElements);
            }
        } else if (currentMode === MODE_TYPE && currentInputfield) {
            if(REG_EXP_CLEAR.test(currentKeyword)){
                executeClearText(currentInputfield);
                return;
            }
            executeSetText(currentInputfield, userCommand);

        } else if (currentMode === MODE_SELECT && currentSelect) {
            if(REG_EXP_SCROLL_DOWN.test(currentKeyword) || REG_EXP_SCROLL_UP.test(currentKeyword) ){
                choiceAction(currentKeyword, null);
                return;
            }
            if (!REG_EXP_NUMBER.test(userCommand)) {
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
            }
            if (!checkNumberInterval(userCommand, currentSelect.select.value.length)){return;}
            try {
                executeSelect(currentSelect, currentSelect.select.value[parseInt(userCommand) - 1]);
                changeInputMode(MODE_NO_MODE);
                $('.vocs_overlay').remove();
            }catch (e){
                console.log(e);
                $('.vocs_overlay').remove();
                return;
            }
        } else if (currentMode === MODE_DATE_TIME){
            if(REG_EXP_CLEAR.test(currentKeyword)){
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
                if (!REG_EXP_NUMBER.test(userCommand)) {return;}
                handleDateTime(currentDateTime, userCommand);
                return;
            }catch (e){
                console.warn(e);
            }
        }
        clearCurrentElements();
        let t1 = performance.now();
        console.log('Execution time: ' + (t1 - t0) + ' mil');
    }

    /**
     * Main function end
     ******************************************************************************************************************/

    function choiceAction(keyword, userCommand) {
        if (!keyword) {return;}

        switch (true) {
            case REG_EXP_CLICK.test(keyword):
                currentElements.push(...searchForElements(userCommand));
                if (currentElements.length === 1) {
                    handleElement(currentElements[0]);
                }
                break;
            case REG_EXP_SCROLL_DOWN.test(keyword):
                if(currentSelect){
                    scrollSelectContainerDown();
                }else{
                    scrollDown();
                }
                break;
            case REG_EXP_SCROLL_UP.test(keyword):
                if(currentSelect){
                    scrollSelectContainerUp();
                }else {
                    scrollUp();
                }
                break;
            case REG_EXP_SCROLL_TO_TOP.test(keyword):
                scrollToTop();
                break;
            case REG_EXP_SCROLL_TO_BOTTOM.test(keyword):
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
            default:
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
        currentInputfield = elem;
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
     * @param input - Benutzereingabe, undefined in der ersten Runde, dann eine Zahl
     */
    function handleDateTime(elem, input) {
        console.error('current value: ' + input);
        let value,
            newValue,
            type;
        if (input){
            //DO not convert to int here, because can't set '0' before number
            value = input.toString().trim().toLowerCase();
        }
        type = elem.elem.type;
        elem.elem.focus();

        switch (type){
            case 'datetime-local':
                console.warn('type: ' + type);
                if(!value){
                    setDateTime(elem, 'Set DAY', currentValue);
                    return;
                }
                if(!day){
                    day = setDay(value);
                    if (day){
                        currentValue += 'D' + day;
                        updateDateTimeMsgAndValue('Set MOTH', currentValue);
                        newValue = '0001-01-' + day + 'T01:01:01';
                        $(elem.elem).val(newValue);
                    } else {
                        updateDateTimeMsgAndValue('Set DAY', 'Please provide valid value');
                    }
                    return;
                }
                if(!month){
                    month = setMonth(value);
                    if (month){
                        currentValue += ' M' + month;
                        updateDateTimeMsgAndValue('Set YEAR', currentValue);
                        newValue = '0001-'+ + month +'-' + day + 'T01:01:01';
                        $(elem.elem).val(newValue);
                    } else {
                        updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                    }
                    return;
                }
                if(!year){
                    year = setYear(value);
                    if (year){
                        currentValue += ' Y' + year;
                        updateDateTimeMsgAndValue('Set SECOND', currentValue);
                        newValue = year + '-' + month + '-' + day + 'T01:01:01';
                        $(elem.elem).val(newValue);
                    } else {
                        updateDateTimeMsgAndValue('Set YEAR', 'Please provide valid value');
                    }
                    return;
                }
                if(!second){
                    second = setSecondOrMinutes(value);
                    if (second){
                        currentValue += ' S' + second;
                        updateDateTimeMsgAndValue('Set MINUTE', currentValue);
                        newValue = year + '-' + month + '-' + day + 'T01:01:' + second;
                        $(elem.elem).val(newValue);
                    } else {
                        updateDateTimeMsgAndValue('Set SECOND', 'Please provide valid value');
                    }
                    return;
                }
                if(!minute){
                    minute = setSecondOrMinutes(value);
                    if (minute){
                        currentValue += ' M' + minute;
                        updateDateTimeMsgAndValue('Set HOUR', currentValue);
                        newValue = year + '-' + month + '-' + day + 'T01:' +  minute  + ':' + second;
                        $(elem.elem).val(newValue);
                    } else {
                        updateDateTimeMsgAndValue('Set MINUTE', 'Please provide valid value');
                    }
                    return;
                }
                if(!hour){
                    hour = setHour(value);
                    if (hour){
                        currentValue += ' H' + hour;
                        newValue = year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second;
                        try {
                            executeSetDateTime(currentDateTime, newValue);
                            changeInputMode(MODE_NO_MODE);
                        } catch (e){
                            console.error('Can not set value: ' + newValue);
                        }
                    } else {
                        updateDateTimeMsgAndValue('Set HOUR', 'Please provide valid value');
                    }
                }
                break;
            case 'time':
                if(!value){
                    setDateTime(elem, 'Set MINUTE', currentValue);
                    return;
                }
                if(!minute){
                    minute = setSecondOrMinutes(value);
                    if (minute){
                        currentValue += ' M' + minute;
                        updateDateTimeMsgAndValue('Set HOUR', currentValue);
                    } else {
                        updateDateTimeMsgAndValue('Set MINUTE', 'Please provide valid value');
                    }
                    return;
                }
                if(!hour){
                    hour = setHour(value);
                    if (hour){
                        newValue = hour + ':' + minute;
                        try {
                            executeSetDateTime(currentDateTime, newValue);
                            changeInputMode(MODE_NO_MODE);
                        } catch (e){
                            console.error('Can not set value: ' + newValue);
                        }
                    } else {
                        updateDateTimeMsgAndValue('Set HOUR', 'Please provide valid value');
                    }
                }

                break;
            case 'week':
                if(!value){
                    setDateTime(elem, 'Set WEEK', currentValue);
                    return;
                }
                if(!week){
                    week = setWeek(value);
                    if (week){
                        currentValue += ' W' + week;
                        updateDateTimeMsgAndValue('Set YEAR', currentValue);
                    } else {
                        updateDateTimeMsgAndValue('Set WEEK', 'Please provide valid value');
                    }
                    return;
                }
                if(!year){
                    year = setYear(value);
                    if (year){
                        newValue = year + '-W' + week;
                        try {
                            executeSetDateTime(currentDateTime, newValue);
                            changeInputMode(MODE_NO_MODE);
                        } catch (e){
                            console.error('Can not set value: ' + newValue);
                        }
                    } else {
                        updateDateTimeMsgAndValue('Set HOUR', 'Please provide valid value');
                    }
                }
                break;
            case 'date':
                if(!value){
                    setDateTime(elem, 'Set DAY', currentValue);
                    return;
                }
                if(!day){
                    day = setDay(value);
                    if (day){
                        currentValue += 'D' + day;
                        updateDateTimeMsgAndValue('Set MONTH', currentValue);
                    } else {
                        updateDateTimeMsgAndValue('Set DAY', 'Please provide valid value');
                    }
                    return;
                }
                if(!month){
                    month = setMonth(value);
                    if (month){
                        currentValue += ' M' + month;
                        updateDateTimeMsgAndValue('Set YEAR', currentValue);
                    } else {
                        updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                    }
                    return;
                }
                if(!year){
                    year = setYear(value);
                    if (year){
                        newValue = year + '-' + month + '-' + day;
                        try {
                            executeSetDateTime(currentDateTime, newValue);
                            changeInputMode(MODE_NO_MODE);
                        } catch (e){
                            console.error('Can not set value: ' + newValue);
                        }
                    } else {
                        updateDateTimeMsgAndValue('Set YEAR', 'Please provide valid value');
                    }
                    return;
                }
                break;
            case 'month':
                if(!value){
                    setDateTime(elem, 'Set MONTH', currentValue);
                    return;
                }
                if(!month){
                    month = setMonth(value);
                    if (month){
                        currentValue += ' M' + month;
                        updateDateTimeMsgAndValue('Set YEAR', currentValue);
                    } else {
                        updateDateTimeMsgAndValue('Set MONTH', 'Please provide valid value');
                    }
                    return;
                }
                if(!year){
                    year = setYear(value);
                    if (year){
                        newValue = year + '-' + month;
                        try {
                            executeSetDateTime(currentDateTime, newValue);
                            changeInputMode(MODE_NO_MODE);
                        } catch (e){
                            console.error('Can not set value: ' + newValue);
                        }
                    } else {
                        updateDateTimeMsgAndValue('Set YEAR', 'Please provide valid value');
                    }
                    return;
                }
                break;
            case 'number':
                if(!value){
                    setDateTime(elem, 'Set NUMBER', currentValue);
                    return;
                }
                if(!number){
                    number = setNumber(currentDateTime, value);
                    if (number){
                        newValue = number;
                        try {
                            executeSetDateTime(currentDateTime, newValue);
                            changeInputMode(MODE_NO_MODE);
                        } catch (e){
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
     *Setup Google Speech Recognition
     */
    try {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        //recognition.start();

        recognition.onresult = function (event) {

            let recognitionResult = event.results[0][0].transcript;

            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            provideSystemStatus(STATE_LISTENING, transcript);

            if (recognitionResult) {

                if (event.results[0].isFinal) {
                    provideSystemStatus(STATE_YOU_SAY, recognitionResult);
                    performUserAction(recognitionResult);
                    clearUI();
                }
            }

        };
        recognition.addEventListener('end', recognition.start);
        recognition.onerror = function (e) {
            console.error('Error on recognition: ');
            console.error(e);
        };

        $('#startRecord').click(function () {
            if (!systemRecognitionState) {
                provideSystemStatus('Say something', '');
                recognition.start();
                systemRecognitionState = STATE_ACTIVE;
                console.log('+++++STOP Recognition++++++');
            }
            /*else {
                           recognition.start();
                           systemRecognitionState = STATE_ACTIVE;
                           console.log('+++++START Recognition++++++');
                       }*/

        });
    }
    catch (e) {
        console.error('Web Speech error: ' + e);
    }

    function provideSystemStatus(state, textOnRecognition) {
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

    function getRecognizedKeyword(keyword) {
        $.each(KEYWORDS_OBJECTS, (index, value) => {
            if (value.regExp.test(keyword)) {
                //Keyword von der SP Software richtig erkannt
                return keyword;
            }
        });
        //Sonst Keyword vermuten
        try {
            let result = fuzzySearchForKeywords(KEYWORDS_OBJECTS, keyword);
            if (result && result.length > 0) {
                return result[0];
            }
            return undefined;
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    function changeInputMode(newInputMode) {
        currentMode = newInputMode;
        if (currentMode === MODE_NO_MODE) {
            $('.vocs_overlay').remove();
            if (currentInputfield) {currentInputfield.elem.blur(); currentInputfield = null;}
            if (currentDateTime) {currentDateTime.elem.blur(); currentDateTime = null;}
            currentSelect = null;
        }
        console.log('------Current MODE------: ' + currentMode);
    }

    function clearDateTimeValues (){
        day = undefined;
        week = undefined;
        month = undefined;
        year = undefined;
        second = undefined;
        minute = undefined;
        hour = undefined;
        currentValue = '';
    }
};