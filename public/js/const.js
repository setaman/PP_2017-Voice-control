/**
 * Selectors
 */
const CLICK_SELECTORS = 'a, :button, :submit, :reset, .vocs_clickable';
const FOCUS_SELECTORS = 'input:not([type]), input[type="email"], input[type="text"], input[type="password"],' +
    'input[type="search"], input[type="tel"], input[type="url"], input[type="hidden"], textarea, input[type="search"]';
const CHECK_SELECTORS = ':radio, :checkbox';
const SELECT_SELECTORS = 'select';
const DATE_TIME_SELECTORS = 'input[type="number"],input[type="week"],input[type="time"],input[type="month"],input[type="date"], input[type="datetime-local"]';
const ALL_SELECTOR = `${CLICK_SELECTORS}, ${FOCUS_SELECTORS}, ${CHECK_SELECTORS}, ${SELECT_SELECTORS}, ${DATE_TIME_SELECTORS}`;
/**
 * Keywords ENG
 */
const VOCS = 'vocs';
const CLICK = 'click';
const OFF = 'off';
const UP = 'up';
const DOWN = 'down';
const BOTTOM = 'bottom';
const TOP = 'top';
const STOP = 'stop';
const SHOW = 'show';
const DELETE = 'delete';
const CLEAR = 'clear';
const INFO = 'info';
/**
 * RegExp ENG
 */
const REG_EXP_VOCS = /^(vocs)$/;
const REG_EXP_CLICK = /^(click)$/;
const REG_EXP_OFF = /^(off)$/;
const REG_EXP_UP = /^(up)$/;
const REG_EXP_DOWN = /^(down)$/;
const REG_EXP_TOP = /^(top)$/;
const REG_EXP_BOTTOM = /^(bottom)$/;
const REG_EXP_STOP = /^(stop)$/;
const REG_EXP_SHOW = /^(show)$/;
const REG_EXP_CLEAR = /^(clear)$/;
const REG_EXP_DELETE = /^(delete)$/;
const REG_EXP_INFO = /^(info)$/;
const REG_EXP_NUMBER = /^[0-9]+$/;
/**
 * Keywords object needed for fuzzy search
 */
const KEYWORDS_OBJECTS = [
    {keyword: CLICK,
        regExp: REG_EXP_CLICK},
    {keyword: STOP,
        regExp: REG_EXP_STOP},
    {keyword: UP,
        regExp: REG_EXP_UP},
    {keyword: DOWN,
        regExp: REG_EXP_DOWN},
    {keyword: BOTTOM,
        regExp: REG_EXP_BOTTOM},
    {keyword: SHOW ,
        regExp: REG_EXP_SHOW},
    {keyword: CLEAR ,
        regExp: REG_EXP_CLEAR},
    {keyword: TOP,
        regExp: REG_EXP_TOP},
    {keyword: DELETE,
        regExp: REG_EXP_DELETE},
    {keyword: INFO,
        regExp: REG_EXP_INFO}
];
/**
 * Input Modes
 * */
const MODE_NO_MODE = 0;
const MODE_TYPE = 1;
const MODE_SELECT = 2;
const MODE_MULTIPLE = 3;
const MODE_DATE_TIME = 4;
/**
 * Types of elements
 * */
const TYPE_CLICKABLE = 0;
const TYPE_FOCUSABLE = 1;
const TYPE_SELECTABLE = 2;
const TYPE_DATE_TIME = 3;
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
export {SELECT_SELECTORS, DATE_TIME_SELECTORS, CHECK_SELECTORS, SHOW, CLICK_SELECTORS, FOCUS_SELECTORS, ALL_SELECTOR, REG_EXP_INFO, REG_EXP_DELETE,
        CLICK, OFF, VOCS, CLEAR,DOWN, UP, BOTTOM, TOP, STOP, REG_EXP_CLICK, REG_EXP_VOCS, REG_EXP_OFF, REG_EXP_SHOW, REG_EXP_NUMBER, REG_EXP_DOWN, STATE_MULTIPLE_MATCH, REG_EXP_TOP,REG_EXP_CLEAR, REG_EXP_BOTTOM,REG_EXP_STOP, REG_EXP_UP,
        MODE_TYPE, MODE_SELECT, MODE_DATE_TIME, MODE_NO_MODE, MODE_MULTIPLE, STATE_LISTENING, STATE_ERROR, STATE_YOU_SAY, STATE_NO_MATCH
        ,STATE_ACTIVE, STATE_INACTIVE, TYPE_CLICKABLE, TYPE_FOCUSABLE, TYPE_SELECTABLE, TYPE_DATE_TIME, KEYWORDS_OBJECTS};

