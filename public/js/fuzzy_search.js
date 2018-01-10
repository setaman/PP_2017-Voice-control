import Fuse from 'fuse.js/dist/fuse.min';

let options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        "title",
        "author.firstName"
    ]
};

export function fuseSearch(list) {
    let fuse = new Fuse(list, options); // "list" is the item array
    return fuse.search("fallen");
}