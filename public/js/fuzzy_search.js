import Fuse from 'fuse.js/dist/fuse.min';

let options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: 'label',
    label: 'label'
};

let e = [
    {label: 'home'},
    {label: 'ho'},
    {label: 'me'},
    {label: 'he'}
];

export function fuzzySearch(list, searchString) {
    let fuse = new Fuse(e, options);
    return fuse.search(searchString);
}