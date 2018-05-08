import Fuse from 'fuse.js/dist/fuse.min';

//siehe http://fusejs.io/

let optionsForElements = {
    shouldSort: true,
    tokenize: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    //FIXME: what about OPTION for selects???
    keys: ['text', 'label', 'value', 'placeholder']
};

let optionsForKeywords = {
    shouldSort: true,
    threshold: 0.5,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: ['keyword'],
    id: 'keyword'
};

let optionsForVocs = {
    threshold: 0.8,
    location: 0,
    distance: 500,
    maxPatternLength: 10,
    minMatchCharLength: 3,
    keys: ['vocs'],
    id: 'vocs'
};

/**
 * Unscharfe Suche nach einem Element
 * @param list - Liste von Elementen
 * @param searchString - Benutzereingabe
 * @return {*|any[]} - Resultat der Suche, Alle berechneten Elemente
 */
export function fuzzySearchForElements(list, searchString) {
    let fuse = new Fuse(list, optionsForElements);
    return fuse.search(searchString);
}

/**
 * Unscharfe Suche nach einem Keyword
 * @param list - Liste von Keywords
 * @param searchString - Benutzereingabe
 * @return {*|any[]} - Resultat der Suche, Alle berechneten Keywords
 */
export function fuzzySearchForKeywords(list, searchString) {
    let fuse = new Fuse(list, optionsForKeywords);
    return fuse.search(searchString);
}

export function fuzzySearchForVocs(searchString) {
    let fuse = new Fuse([{vocs:'vocs'}], optionsForVocs);
    return fuse.search(searchString);
}