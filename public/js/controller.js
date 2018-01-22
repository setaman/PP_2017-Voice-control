/**
 * Created by Pastuh on 19.10.2017.
 */
import {
    REG_EXP_CLICK,
    REG_EXP_OFF,
    REG_EXP_SEARCH,
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
    KEYWORDS_OBJECTS, REG_EXP_SHOW, SHOW, REG_EXP_NUMBER, TYPE_SELECTABLE,
} from './const';
import {getElements, searchForElements} from './search_for_elements';
import {
    scrollUp,
    scrollDown,
    scrollToBottom,
    scrollToTop,
    executeSetText, executeAction, executeSelect
} from './actions';
import {
    buildMultipleWrapper, buildSelectOptionsWrapper, extractKeyword, extractSearchString, scrollSelectContainerDown,
    scrollSelectContainerUp
} from "./helper";
import {fuzzySearchForKeywords} from "./fuzzy_search";

import 'jquery-ui-dist/jquery-ui.min'
import wordsToNumbers from 'words-to-numbers';
//import '../css/vocs_styles.css'
import speechRecognition from './visualizer';

let currentElements = [];
let currentMultipleElements = [];
let currentInputfield;
let currentSelect;
let currentMode = MODE_NO_MODE;
let systemRecognitionState = false;
let currentKeyword;
let currentSearchString;


window.onload = function () {

    speechRecognition();

    let systemState = $('#vocs_text_status');
    let OnRecognition = $('#vocs_text_onrecognition');

    $('#search').click(function () {
        performUserAction($('#search-input').val());
    });

    /*$('html, body').click(function () {
        changeInputMode(MODE_NO_MODE);
    });*/

    /*******************************************************************************************************************
     * Main function
     * @param input - recognized User command
     */
    function performUserAction(input) {

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
                let elem = currentMultipleElements[parseInt(userCommand) - 1];

                executeAction(elem.elem);
                changeInputMode(MODE_NO_MODE);

                if (elem.type === TYPE_FOCUSABLE) {
                    currentInputfield = elem.elem;
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
            executeSetText(currentInputfield, userCommand);

        } else if (currentMode === MODE_SELECT && currentSelect) {
            if(REG_EXP_SCROLL_DOWN.test(currentKeyword) || REG_EXP_SCROLL_UP.test(currentKeyword) ){
                choiceAction(currentKeyword, null);
                return;
            }

            if (!REG_EXP_NUMBER.test(userCommand)) {
                userCommand = wordsToNumbers(userCommand, {fuzzy: true});
            }
            try {
                executeSelect(currentSelect.elem, currentSelect.select.value[parseInt(userCommand) - 1]);
                changeInputMode(MODE_NO_MODE);
                $('.vocs_overlay').remove();
            }catch (e){
                console.log(e);
                $('.vocs_overlay').remove();
                return;
            }

            /*$(currentSelect).find('option').each(function () {
                if ($(this).text().toLowerCase().trim().startsWith(input.toLowerCase().trim())) {
                    $(this).prop('selected', true);
                    $(currentSelect).selectmenu("refresh");
                    changeInputMode(MODE_NO_MODE);
                }
            });*/
        }
        clearCurrentElements();
        let t1 = performance.now();
        console.log('Execution time: ' + (t1 - t0) + ' mil');
    }

    /**
     * Main function end
     ******************************************************************************************************************/

    function choiceAction(keyword, userCommand) {

        switch (true) {
            case REG_EXP_CLICK.test(keyword):
                currentElements.push(...searchForElements(userCommand));
                if (currentElements.length === 1) {
                    if (currentElements[0].type === TYPE_FOCUSABLE) {
                        setInputField();
                        return;
                    } else if (currentElements[0].type === TYPE_SELECTABLE) {
                        setCustomSelectContainer();
                        return;
                    }
                    executeAction(currentElements[0].elem);
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
            case REG_EXP_SEARCH.test(keyword):
                /**
                 * TODO: implement this
                 */
                break;
            case REG_EXP_OFF.test(keyword):
                /**
                 * TODO: implement this
                 */
                break;
            default:
        }
    }

    function setInputField() {
        currentInputfield = currentElements[0].elem;
        changeInputMode(MODE_TYPE);
        executeAction(currentElements[0].elem);
    }

    function setCustomSelectContainer() {
        $('body').prepend('<div class="vocs_overlay"></div>');
        buildSelectOptionsWrapper(currentElements[0]);
        currentSelect = currentElements[0];
        changeInputMode(MODE_SELECT);
    }

    function multipleElementsSelected() {
        $('body').prepend('<div class="vocs_overlay"></div>');

        for (let i = 0; i < currentElements.length; i++) {

            if ($(currentElements[i].elem).is('input') && currentElements[i].label) {
                buildMultipleWrapper(i, currentElements[i]);
            } else {
                buildMultipleWrapper(i, currentElements[i]);
            }
            changeInputMode(MODE_MULTIPLE);
            currentMultipleElements.push(currentElements[i]);
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
            $(currentInputfield).blur();
            currentInputfield = null;
            currentSelect = null;
        }
        console.log('------Current MODE------: ' + currentMode);
    }
};




