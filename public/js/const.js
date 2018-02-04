/**
 * Selectors
 */
const CLICK_SELECTORS = 'a, :button, :submit, :reset, .vocs_clickable';
const FOCUS_SELECTORS = 'input[type="number"],input[type="week"],input[type="time"],input[type="month"],input[type="date"], input[type="datetime-local"], input[type="email"], input[type="text"], input[type="password"], input[type="number"],' +
    'input[type="search"], input[type="tel"], input[type="url"], input[type="hidden"], textarea';
const CHECK_SELECTORS = ':radio, :checkbox';
const SELECT_SELECTORS = 'select';
const SEARCH_SELECTORS = 'input[type="search"]';
const ALL_SELECTOR = `${CLICK_SELECTORS}, ${FOCUS_SELECTORS}, ${CHECK_SELECTORS}, ${SELECT_SELECTORS}, ${SEARCH_SELECTORS}`;
/**
 * Keywords
 */
const CLICK = 'click';
const CHECK = 'check';
const FOCUS = 'focus';
const OFF = 'off';
const SELECT = 'select';
const SCROLL_UP = 'up';
const SCROLL_DOWN = 'down';
const SCROLL_TO_BOTTOM = 'bottom';
const SCROLL_TO_TOP = 'top';
const SEARCH = 'search';
const STOP = 'stop';
const SHOW = 'show';
const CLEAR = 'show';
/**
 * RegExp
 */
let REG_EXP_CLICK = /^(click)$/;
let REG_EXP_FOCUS = /^(focus)$/;
let REG_EXP_OFF = /^(off)$/;
let REG_EXP_SEARCH = /^(search)$/;
let REG_EXP_CHECK = /(check)\s[[a-zA-Z0-9\.]/;
let REG_EXP_SELECT = /(select)\s[[a-zA-Z0-9\.]/;
let REG_EXP_SCROLL_UP = /^(up)$/;
let REG_EXP_SCROLL_DOWN = /^(down)$/;
let REG_EXP_SCROLL_TO_TOP = /^(top)$/;
let REG_EXP_SCROLL_TO_BOTTOM = /^(bottom)$/;
let REG_EXP_STOP = /^(stop)$/;
let REG_EXP_SHOW = /^(show)$/;
let REG_EXP_NUMBER = /^[0-9]+$/;
/**
 * Keywords object needed for fuzzy search
 */
const KEYWORDS_OBJECTS = [
    {keyword: CLICK,
        regExp: REG_EXP_CLICK},
    {keyword: CHECK,
        regExp: REG_EXP_CHECK},
    {keyword: FOCUS,
        regExp: REG_EXP_FOCUS},
    {keyword: STOP,
        regExp: REG_EXP_STOP},
    {keyword: SCROLL_UP,
        regExp: REG_EXP_SCROLL_UP},
    {keyword: SCROLL_DOWN,
        regExp: REG_EXP_SCROLL_DOWN},
    {keyword: SCROLL_TO_BOTTOM,
        regExp: REG_EXP_SCROLL_TO_BOTTOM},
    {keyword: SHOW ,
        regExp: REG_EXP_SHOW},
    {keyword: SCROLL_TO_TOP,
        regExp: REG_EXP_SCROLL_TO_TOP}
];
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
const TYPE_DATE = 3;
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
export {SELECT_SELECTORS, CHECK_SELECTORS, SHOW, CLICK_SELECTORS, SEARCH_SELECTORS, FOCUS_SELECTORS, ALL_SELECTOR,
        CLICK, FOCUS, OFF, SELECT,SCROLL_DOWN, SCROLL_UP, SCROLL_TO_BOTTOM, SCROLL_TO_TOP, SEARCH, CHECK, STOP,
        REG_EXP_CLICK, REG_EXP_FOCUS, REG_EXP_OFF, REG_EXP_SEARCH, REG_EXP_CHECK, REG_EXP_SELECT, REG_EXP_SHOW, REG_EXP_NUMBER,
        REG_EXP_SCROLL_DOWN, STATE_MULTIPLE_MATCH, REG_EXP_SCROLL_TO_TOP, REG_EXP_SCROLL_TO_BOTTOM,REG_EXP_STOP, REG_EXP_SCROLL_UP,
        MODE_TYPE, MODE_SELECT, MODE_NO_MODE, MODE_MULTIPLE, STATE_LISTENING, STATE_ERROR, STATE_YOU_SAY, STATE_NO_MATCH
        ,STATE_ACTIVE, STATE_INACTIVE, TYPE_CLICKABLE, TYPE_FOCUSABLE, TYPE_SELECTABLE, TYPE_DATE, KEYWORDS_OBJECTS};

