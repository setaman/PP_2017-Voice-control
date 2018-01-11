/**
 * Selectors
 */
const CLICK_SELECTORS = 'a, li, :button, :submit, :reset, .vocs_clickable';
const GO_TO_SELECTORS = 'input[type=""], input[type="email"], input[type="text"], input[type="password"], input[type="number"],' +
    'input[type="search"], input[type="tel"], input[type="url"], input[type="hidden"], textarea, .vocs_focusable';
const CHECK_SELECTORS = ':radio, :checkbox';
const SELECT_SELECTORS = 'select';
const SEARCH_SELECTORS = 'input[type="search"]';
/**
 * Keywords
 */
const CLICK = 'click';
const CHECK = 'check';
const FOCUS = 'focus';
const OFF = 'off';
const SELECT = 'select';
const SCROLL_UP = 'scroll up';
const SCROLL_DOWN = 'scroll down';
const SCROLL_TO_BOTTOM = 'scroll to bottom';
const SCROLL_TO_TOP = 'scroll to top';
const SEARCH = 'search';
const STOP = 'stop';
/**
 * Keywords object needed for fuzzy search
 */
const KEYWORDS_OBJECT = [
    {keyword: CLICK},
    {keyword: CHECK},
    {keyword: FOCUS}
];
/**
 * RegExp
 */
let REG_EXP_CLICK = /(click)\s[[a-zA-Z0-9\.]/;
let REG_EXP_GO_TO = /(focus)\s[[a-zA-Z0-9\.]/;
let REG_EXP_OFF = /^(off)$/;
let REG_EXP_SEARCH = /^(search)$/;
let REG_EXP_CHECK = /(check)\s[[a-zA-Z0-9\.]/;
let REG_EXP_SELECT = /(select)\s[[a-zA-Z0-9\.]/;
let REG_EXP_SCROLL_UP = /(scroll up)(\s[[a-zA-Z0-9\.])?/;
let REG_EXP_SCROLL_DOWN = /(scroll down)(\s[[a-zA-Z0-9\.])?/;
let REG_EXP_SCROLL_TO_TOP = /(scroll)\s(to\s)?(top)(\s[[a-zA-Z0-9\.])?/;
let REG_EXP_SCROLL_TO_BOTTOM = /(scroll)\s(to\s)?(bottom)(\s[[a-zA-Z0-9\.])?/;
let REG_EXP_STOP = /^(stop)$/;
/**
 * Input Modes
 * */
const MODE_NO_MODE = 0;
const MODE_TYPE = 1;
const MODE_SELECT = 2;
const MODE_MULTIPLE = 3;
/**
 * Types of elements
 * */
const TYPE_CLICKABLE = 0;
const TYPE_FOCUSABLE = 1;
const TYPE_SELECTABLE = 2;
/**
 * System States for UI
 */
const STATE_LISTENING = 'Listening';
const STATE_ERROR = 'Some error';
const STATE_NO_MATCH = 'No element found';
const STATE_MULTIPLE_MATCH = 'Many elements found:';
const STATE_YOU_SAY = 'You said:';
const STATE_ACTIVE = true;
const STATE_INACTIVE = false;
/**
 * Export consts
 */
export {SELECT_SELECTORS, CHECK_SELECTORS, CLICK_SELECTORS, SEARCH_SELECTORS, GO_TO_SELECTORS,
        CLICK, FOCUS, OFF, SELECT,SCROLL_DOWN, SCROLL_UP, SCROLL_TO_BOTTOM, SCROLL_TO_TOP, SEARCH, CHECK, STOP,
        REG_EXP_CLICK, REG_EXP_GO_TO, REG_EXP_OFF, REG_EXP_SEARCH, REG_EXP_CHECK, REG_EXP_SELECT, REG_EXP_SCROLL_DOWN,
        STATE_MULTIPLE_MATCH, REG_EXP_SCROLL_TO_TOP, REG_EXP_SCROLL_TO_BOTTOM,REG_EXP_STOP, REG_EXP_SCROLL_UP,
        MODE_TYPE, MODE_SELECT, MODE_NO_MODE, MODE_MULTIPLE, STATE_LISTENING, STATE_ERROR, STATE_YOU_SAY, STATE_NO_MATCH
        ,STATE_ACTIVE, STATE_INACTIVE, TYPE_CLICKABLE, TYPE_FOCUSABLE, TYPE_SELECTABLE, KEYWORDS_OBJECT};

