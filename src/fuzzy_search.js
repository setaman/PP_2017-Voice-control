import Fuse from 'fuse.js';

let optionsForElements = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    minMatchCharLength: 1,
    keys: ['text', 'label', 'value', 'placeholder']
};

let optionsForKeywords = {
    shouldSort: true,
    threshold: 0.5,
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    keys: ['keyword']
};

let optionsForVocs = {
    threshold: 0.75,
    location: 0,
    distance: 100,
    minMatchCharLength: 3,
    keys: ['vocs']
};

export function fuzzySearchForElements(list, searchString) {
    let fuse = new Fuse(list, optionsForElements);
    return fuse.search(searchString).map(r => r.item);
}

export function fuzzySearchForKeywords(list, searchString) {
    let fuse = new Fuse(list, optionsForKeywords);
    return fuse.search(searchString).map(r => r.item.keyword);
}

export function fuzzySearchForVocs(searchString) {
    let fuse = new Fuse([{vocs:'vocs'}], optionsForVocs);
    return fuse.search(searchString).map(r => r.item.vocs);
}

export function fuzzySearch(elementString, userInput) {
    let fuse = new Fuse([{text: elementString}], optionsForElements);
    return fuse.search(userInput);
}
