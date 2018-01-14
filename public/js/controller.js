/**
 * Created by Pastuh on 19.10.2017.
 */
import {
    SELECT_SELECTORS, CHECK_SELECTORS, CLICK_SELECTORS, SEARCH_SELECTORS, FOCUS_SELECTORS,
    CLICK, FOCUS, OFF, SELECT, CHECK, SCROLL_DOWN, SCROLL_UP, SCROLL_TO_BOTTOM, SCROLL_TO_TOP, SEARCH, STOP,
    REG_EXP_CLICK, REG_EXP_FOCUS, REG_EXP_OFF, REG_EXP_SEARCH, REG_EXP_CHECK, REG_EXP_SELECT, REG_EXP_SCROLL_DOWN,
    REG_EXP_SCROLL_TO_TOP, REG_EXP_SCROLL_TO_BOTTOM, REG_EXP_STOP, REG_EXP_SCROLL_UP,
    MODE_TYPE, MODE_SELECT, MODE_NO_MODE, STATE_LISTENING, STATE_ERROR, STATE_YOU_SAY, STATE_NO_MATCH, STATE_ACTIVE,
    STATE_INACTIVE, STATE_MULTIPLE_MATCH, MODE_MULTIPLE, TYPE_FOCUSABLE, KEYWORDS_OBJECTS, ALL_SELECTORS, ROUND1,ROUND2, ROUND3
} from './const';
import {
    searchForButtons,
    searchForInputFields,
    searchForCheckboxesAndRadios,
    searchForSelect,
    getLabel
} from './search_for_elements';
import {
    scrollUp,
    scrollDown,
    scrollToBottom,
    scrollToTop,
    executeClick,
    executeSetText,
    executeFocus,
    executeCheck, executeAction
} from './actions';
import {
    buildMultipleWrapper, splitUserCommand, getTypeOfElement, collectElementsLabel, extractKeyword,
    extractSearchString
} from "./helper";
import {fuzzySearchForElements, fuzzySearchForKeywords} from "./fuzzy_search";

import 'jquery-ui-dist/jquery-ui.min'
import wordsToNumbers from 'words-to-numbers';
//import '../css/vocs_styles.css'
import speechRecognition from './visualizer';
import {elementBuilder} from "./element";

let currentElements = [];
let currentMultipleElements = [];
let currentInputfield;
let currentSelect;
let currentMode = MODE_NO_MODE;
let systemRecognitionState = false;
let currentKeyword;
let currentSearchString;

console.log(elementBuilder(ALL_SELECTORS));

/*window.onload = function () {

    speechRecognition();

    let systemState = $('#vocs_text_status');
    let OnRecognition = $('#vocs_text_onrecognition');

    $('#search').click(function () {
        performUserAction($('#search-input').val());
    });

    /!*$('#hide').click(function () {
        currentSelect.hide().blur();
    });*!/

    /!*$('html, body').click(function () {
        changeInputMode(MODE_NO_MODE);
    });*!/

    function performUserAction(input) {

        let t0 = performance.now();

        let userCommand = input.toString().toLowerCase().trim();

        currentKeyword = getRecognizedKeyword(extractKeyword(userCommand));
        currentSearchString = extractSearchString(userCommand);
        //currentSearchString = getRecognizedLabel(extractSearchString(userCommand));
        console.log('Keyword: ' + currentKeyword + ' || Search String: ' + ((currentSearchString !== '') ? currentSearchString : 'no search string'));

        if (currentKeyword && (REG_EXP_STOP.test(currentKeyword) || REG_EXP_STOP.test(getRecognizedKeyword(currentKeyword)))) {
            changeInputMode(MODE_NO_MODE);
            return;
        }

        if (currentMode === MODE_MULTIPLE) {
            try {

                /!**
                 * TODO: fix words to number
                 *!/
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
                console.log('NUmbER after convert: ' + userCommand);
                let elem = currentMultipleElements[parseInt(userCommand) - 1];

                executeAction(elem);
                changeInputMode(MODE_NO_MODE);

                if (getTypeOfElement(elem) === TYPE_FOCUSABLE) {
                    currentInputfield = elem;
                    changeInputMode(MODE_TYPE);
                }
                currentMultipleElements = [];

                $('.vocs_overlay').remove();

                provideSystemStatus('You choose:', userCommand);

            } catch (e) {
                console.error('Error im MULTIPLE mode: ' + e);
            }
            return;
        }

        if (currentMode === MODE_NO_MODE && currentKeyword) {

            choiceAction(currentKeyword, currentSearchString, ROUND1);
            //Second Round Search
            if (currentElements.length === 0) {
                /!**
                 * FIXME: falls kein element gefunden, werd multiplElementsSelected() aufgerufen
                 *!/
                choiceAction(currentKeyword, currentSearchString, ROUND2);
                if (currentSearchString.length === 0){
                    //Third Round Search
                    choiceAction(currentKeyword, currentSearchString, ROUND3);
                }
            }

            if (currentElements.length === 0) {
                provideSystemStatus(STATE_NO_MATCH, 'Please try again');
                console.error('-------------No element found------------------');

            } else if (currentElements.length > 1) {
                multipleElementsSelected();
                provideSystemStatus(STATE_MULTIPLE_MATCH, 'Please choose a NUMBER');
            }
            console.log(currentElements);


        } else if (currentMode === MODE_TYPE && currentInputfield) {
            executeSetText(currentInputfield, userCommand);

        } else if (currentMode === MODE_SELECT && currentSelect) {

            $(currentSelect).find('option').each(function () {
                console.log('//////FOUND option////////: ' + $(this).text().toLowerCase().trim());
                if ($(this).text().toLowerCase().trim().startsWith(input.toLowerCase().trim())) {
                    $(this).prop('selected', true);
                    $(currentSelect).selectmenu("refresh");
                    changeInputMode(MODE_NO_MODE);
                }
            });
        }

        clearCurrentElements();
        let t1 = performance.now();
        console.log('Execution time: ' + (t1 - t0) + ' mil');
    }

    function multipleElementsSelected() {
        $('body').prepend('<div class="vocs_overlay"></div>');

        for (let i = 0; i < currentElements.length; i++) {

            if ($(currentElements[i]).is('input') && getLabel($(currentElements[i]).attr('id'))) {
                let label = getLabel($(currentElements[i]).attr('id'));
                buildMultipleWrapper(i, label);
            } else {
                buildMultipleWrapper(i, currentElements[i]);
            }
            changeInputMode(MODE_MULTIPLE);
            currentMultipleElements.push(currentElements[i]);
        }
    }

    function changeInputMode(newInputMode) {
        currentMode = newInputMode;
        if (currentMode === MODE_NO_MODE) {
            $('.vocs_overlay').remove();
            $(currentInputfield).blur();
            $(currentSelect).selectmenu('close');
            currentInputfield = null;
            currentSelect = null;
        }
        console.log('------Current MODE------: ' + currentMode);
    }

    /!**
     *Setup Google Speech Recognition
     *!/
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
            /!*else {
                           recognition.start();
                           systemRecognitionState = STATE_ACTIVE;
                           console.log('+++++START Recognition++++++');
                       }*!/

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
        currentElements = [];
        currentKeyword = '';
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
            if (result.length > 0 && result !== undefined) {
                return currentKeyword = result[0];
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    function getRecognizedLabel(userCommand) {

        /!*let result = userCommand.match(/^(\S+)\s(.*)/).slice(1);*!/

        console.log('FUZZY:' + userCommand);
        console.log(fuzzySearchForElements(collectElementsLabel(ALL_SELECTORS), userCommand));
        let fuzzy_result = fuzzySearchForElements(collectElementsLabel(ALL_SELECTORS), userCommand);

        if (fuzzy_result !== undefined && fuzzy_result.length > 0) {
            console.log('Recognized label: ' + fuzzy_result[0]);
            return fuzzy_result[0];
        }
        return null;
    }

    function choiceAction(keyword, userCommand, round) {
        console.error('Search ROUND: ' + round);

        switch (true) {
            case REG_EXP_CLICK.test(keyword):
                console.log('Search string for CLICKS: ' + userCommand);
                currentElements.push(...searchForButtons(CLICK_SELECTORS, userCommand, round));
                //currentElements.push(...searchForInputFields(FOCUS_SELECTORS, userCommand));
                //currentElements.push(...searchForCheckboxesAndRadios(CHECK_SELECTORS, userCommand));
                if (currentElements.length === 1) {
                    executeAction(currentElements[0]);

                    if (getTypeOfElement(currentElements[0]) === TYPE_FOCUSABLE) {
                        currentInputfield = $(currentElements[0]);
                        changeInputMode(MODE_TYPE);
                    }
                }

                break;
            case REG_EXP_SCROLL_DOWN.test(keyword):
                scrollDown();
                break;
            case REG_EXP_SCROLL_UP.test(keyword):
                scrollUp();
                break;
            case REG_EXP_SCROLL_TO_TOP.test(keyword):
                scrollToTop();
                break;
            case REG_EXP_SCROLL_TO_BOTTOM.test(keyword):
                scrollToBottom();
                break;
            case REG_EXP_SEARCH.test(keyword):
                /!**
                 * TODO: implement this
                 *!/
                break;
            case REG_EXP_OFF.test(keyword):
                /!**
                 * TODO: implement this
                 *!/
                break;
            default:
        }
    }
};*/


