import {fuzzySearchForElements, fuzzySearchForKeywords, fuzzySearchForVocs} from "./fuzzy_search";
import {KEYWORDS_OBJECTS} from "./const";

/**
 * Elementname wird aus der Benutzereingabe extrahiert
 * @param userCommand - Benutzereingabe
 * @return {*} - Elementname oder undefined
 */
export function getCommandLength(userCommand) {
    /*if (keyword !== KEYWORDS_OBJECTS[0].keyword) {return undefined;}//'click' nicht verwendet*/
    let result = userCommand.split(/[ ,]+/); //Eingabe bei Leerzeichen splitten, //-> [click, awesome, select]
    return result.length;
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
    let keyword = extractKeyword(userCommand); //extract Keyword
    let vocsKeyword = fuzzySearchForVocs(keyword);


    $.each(KEYWORDS_OBJECTS, (index, value) => {
        if (value.regExp.test(keyword)) {
            //Keyword von der SE Software richtig erkannt
            return keyword;
        }
    });
    //Sonst Keyword vermuten, unscharfe Suche
    try {
        let result = fuzzySearchForKeywords(KEYWORDS_OBJECTS, keyword);
        if (result && result.length > 0) {
            return result[0]; // berechnetes Keyword
        } else if (vocsKeyword.length > 0) {
            return vocsKeyword[0];
        }
        return undefined;// no keyword identified
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
    return result[0]; //click
}

/**
 * Unscharfe Suche nach einem Element
 * @param elements - Array von Element-Objekten
 * @param name - Elementname
 * @return {*} - berechnete Elemente
 */
/*
export function getRecognizedElements(elements, name) {
    /!**
     * TODO: optimize search for long strings with fuzzy
     *!/
    let fuzzy_result = fuzzySearchForElements(elements, name);//unscharfe Suche
    if (fuzzy_result !== undefined && fuzzy_result.length > 0) {
        console.log('FUZZY found:');
        console.log(fuzzy_result);
        return fuzzy_result;
    }
    return [];
}*/
