import Fuse from 'fuse.js/dist/fuse.min';

let optionsForElements = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
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

export function fuzzySearchForElements(list, searchString) {
    let fuse = new Fuse(list, optionsForElements);
    return fuse.search(searchString);
}

export function fuzzySearchForKeywords(list, searchString) {
    let fuse = new Fuse(list, optionsForKeywords);
    return fuse.search(searchString);
}