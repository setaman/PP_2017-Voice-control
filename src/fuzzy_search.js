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

let optionsForClick = {
    threshold: 0.75,
    location: 0,
    distance: 100,
    minMatchCharLength: 3,
    keys: ['keyword']
};

export function fuzzySearchForElements(list, searchString) {
    let fuse = new Fuse(list, optionsForElements);
    return fuse.search(searchString).map(r => r.item);
}

export function fuzzySearchForKeywords(list, searchString) {
    let fuse = new Fuse(list, optionsForKeywords);
    return fuse.search(searchString).map(r => r.item.keyword);
}

export function fuzzySearchForClick(searchString) {
    let fuse = new Fuse([{keyword:'click'}], optionsForClick);
    return fuse.search(searchString).map(r => r.item.keyword);
}

export function fuzzySearch(elementString, userInput) {
    let fuse = new Fuse([{text: elementString}], optionsForElements);
    return fuse.search(userInput);
}
