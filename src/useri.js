import '../public/css/vocs_styles.css';
import {startVisualization, stopVizualization} from './visualizer'
import {speaker} from './speaker';
import img_logo from '../public/images/vocs_ui_logo.svg';
import img_start from '../public/images/vocs_ui_start.svg';
import img_menu from '../public/images/vocs_ui_menu.svg';
import img_reload from '../public/images/vocs_ui_reload.svg';
import img_reload_dis from '../public/images/vocs_ui_reload_inactive.svg';
import img_drag from '../public/images/vocs_ui_resize.svg';
import img_min from '../public/images/vocs_ui_min.svg';
import img_mic_off from '../public/images/vocs_ui_mic_dis.svg';

let string_status_en = [
    {
        status_noactive: {
            primary: 'System is not active now',
            secondary: 'Click play to start'
        }
    },
    {
        status_active: {
            primary: 'System is active',
            secondary: 'Say Vocs to start'
        }
    },
    {
        status_error: {
            primary: 'Some error was occurred',
            secondary: 'Please reload the site'
        }
    },
    {
        status_nofound: {
            primary: 'No Element was found',
            secondary: 'Please try again'
        }
    },
    {
        status_nosupport: {
            primary: 'Your browser is not supported',
            secondary: 'Please update your Browser'
        }
    },
    {
        status_listening: {
            primary: 'Listening...',
            secondary: ' '
        }
    },
    {
        status_vocsactivated: {
            primary: 'What can i do?',
            secondary: ''
        }
    }
];

let inputTextInterval = null;
let listeningInterval = null;
let logoRotationInterval = null;

let uiTemplate = $(
    `<div class="vocs_ui_container vocs_ui_container_responsive">
    <div class="vocs_ui">
        <div class="vocs_ui_control">
            <img class="vocs_ui_logo" src="${img_logo}">
            <img class="vocs_ui_start_icon" src="${img_start}">
            <span class="vocs_ui_live_icon"></span>
        </div>
        <div class="vocs_ui_info">
            <img class="vocs_ui_menu vocs_ui_icons_hover" src="${img_menu}">
            <img class="vocs_ui_reload vocs_ui_icons_hover" src="${img_reload_dis}">
        </div>
        <div class="vocs_ui_display">
            <div class="vocs_canvas_container">
                <canvas class="vocs_visualizer"></canvas>
            </div>
            <div class="vocs_status_container">
                <p class="vocs_ui_primary_text"></p>
                <p class="vocs_ui_secondary_text"></p>
            </div>
        </div>
        <div class="vocs_ui_size">
            <img class="vocs_ui_min vocs_ui_icons_hover" src="${img_min}">
            <img class="vocs_ui_resize vocs_ui_icons_hover" src="${img_drag}">
        </div>
    </div>
    <div class="vocs_ui_input">
        <p class="vocs_ui_input_text"></p>
    </div>  
</div>`);

let strings = {
    status: []
};
strings.status.push(...string_status_en);

class UI {
    constructor() {
        this.isReady = true; //is true if the system is browser compatible
        this.isON = false; // true if system was activated by user or by automatic start
        this.isMinimized = false; // true if ui was minimized by user
        this.startAlways = false; // true if user activate this option

        /*Move to const*/
        this.colorSuccess = '#5fa57a';
        this.colorError = '#FF7469';
        this.colorWarn = '#FFCC71';
        this.colorNormal = 'white';
    }

    get isReady() {
        return this._isReady;
    }

    set isReady(value) {
        this._isReady = value;
    }

    drawUI() {
        $('body').append(uiTemplate);

        this.textPrimary = $('.vocs_ui_primary_text');
        this.textSecondary = $('.vocs_ui_secondary_text');
        this.logo = $('.vocs_ui_logo');
        this.startIcon = $('.vocs_ui_start_icon');
        this.liveIcon = $('.vocs_ui_live_icon');
        this.liveIcon.hide();
        this.textInputContainer = $('.vocs_ui_input');
        this.textInputContainer.hide();
        this.startButton = $('.vocs_ui_control');
        //if browser not supported, stop initialization and provide system status
        if (!this.isReady) {
            this.statusNoSupport();
            this.startIcon.hide();
            this.logo.attr('src', `${img_mic_off}`);
            this.startButton.addClass('vocs_ui_notready');
            return;
        }

        dragElement(document.getElementsByClassName('vocs_ui_resize')[0], document.getElementsByClassName('vocs_ui_container')[0]);

        this.uiContainer = $('.vocs_ui_container');
        this.startButton.click(() => {
            if (this.isON) {
                this.deactivateSystem();
            } else {
                this.activateSystem();
            }
        });
        this.textInput = $('.vocs_ui_input_text');
        this.display = $('.vocs_ui_display');
        this.info = $('.vocs_ui_info');
        this.minButton = $('.vocs_ui_min');
        this.minButton.click(() => {
            this.minimizeUI();
        });
        this.reloadButton = $('.vocs_ui_reload');

        this.reloadButton.click(() => {
            if (!this.startAlways) {
                if (storageAvailable('localStorage')) {
                    this.reloadButton.attr('src', `${img_reload}`);
                    setLocalStorageItem('alwaysActive', 'true');
                    this.startAlways = true;
                }
            } else {
                if (storageAvailable('localStorage')) {
                    this.reloadButton.attr('src', `${img_reload_dis}`);
                    setLocalStorageItem('alwaysActive', 'false');
                    this.startAlways = false;
                }
            }
        });

        //Init speechSynthesis
        speaker.initSpeaker();

        if (storageAvailable('sessionStorage')) {
            if (getSessionsStorageItem('vocsIsActive') === 'true' || getLocalStorageItem('alwaysActive') === 'true') {
                this.activateSystem();
            } else {
                this.statusNotActive();
            }
            if (getSessionsStorageItem('uiIsMinimized') === 'true') {
                this.minimizeUI();
            }
            if (getLocalStorageItem('alwaysActive') === 'true') {
                this.startAlways = true;
                this.reloadButton.attr('src', `${img_reload}`);
            }
        }
    }

    activateSystem() {
        this.showLoading();
        this.hideLoading();
        this.isON = true;
        this.statusActive();
        this.startIcon.hide(500);
        this.liveIcon.show(500);
        startVisualization();
        if (storageAvailable('sessionStorage')) {
            setSessionStorageItem('vocsIsActive', 'true');
        }
    }

    deactivateSystem() {
        this.isON = false;
        this.liveIcon.hide(500);
        this.startIcon.show(500);
        this.statusNotActive();
        stopVizualization();
        if (storageAvailable('sessionStorage')) {
            setSessionStorageItem('vocsIsActive', 'false');
        }
    }

    showUI() {
        $(this.uiContainer).show(0);
    }

    hideUI() {
        $(this.uiContainer).hide(0);
    }

    minimizeUI() {
        if (!this.isMinimized) {
            this.display.hide(200);
            this.info.hide(200);
            this.uiContainer.removeClass('vocs_ui_container_responsive');
            this.isMinimized = true;
            if (storageAvailable('sessionStorage')) {
                setSessionStorageItem('uiIsMinimized', 'true');
            }
        } else {
            this.display.show(200);
            this.info.show(200);
            this.uiContainer.addClass('vocs_ui_container_responsive');
            this.isMinimized = false;
            if (storageAvailable('sessionStorage')) {
                setSessionStorageItem('uiIsMinimized', 'false');
            }
        }
    }

    showLoading() {
        this.logo.addClass('vocs_logo_rotation');
    }

    hideLoading() {
        setTimeout(() => {
            this.logo.removeClass('vocs_logo_rotation');
        }, 1500);

    }

    statusNotActive() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[0].status_noactive.primary);
        this.textPrimary.css('color', this.colorNormal);
        this.textSecondary.text(strings.status[0].status_noactive.secondary);
        this.showStatusText();
    }

    statusActive() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[1].status_active.primary);
        this.textPrimary.css('color', this.colorSuccess);
        this.textSecondary.text(strings.status[1].status_active.secondary);
        this.showStatusText();
        speaker.speak(`${strings.status[1].status_active.primary}, ${strings.status[1].status_active.secondary}`);
    }

    statusError() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[2].status_error.primary);
        this.textPrimary.css('color', this.colorError);
        this.textSecondary.text(strings.status[2].status_error.secondary);
        this.showStatusText();
    }

    statusNoFound() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[3].status_nofound.primary);
        this.textPrimary.css('color', this.colorWarn);
        this.textSecondary.text(strings.status[3].status_nofound.secondary);
        this.showStatusText();
        speaker.speak(`${strings.status[3].status_nofound.primary}, ${strings.status[3].status_nofound.secondary}`);

    }

    statusNoSupport() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[4].status_nosupport.primary);
        this.textPrimary.css('color', this.colorError);
        this.textSecondary.text(strings.status[4].status_nosupport.secondary);
        this.showStatusText();
        speaker.speak(`${strings.status[4].status_nosupport.primary}, ${strings.status[4].status_nosupport.secondary}`);
    }

    customMessage(primary, secondary) {
        this.hideStatusText();
        this.textPrimary.text(primary);
        this.textPrimary.css('color', this.colorNormal);
        this.textSecondary.text(secondary);
        this.showStatusText();
        speaker.speak(`${primary}, ${secondary}`);
    }

    statusListening() {
        this.textPrimary.text(strings.status[5].status_listening.primary);
        this.textPrimary.css('color', this.colorNormal);
        this.textSecondary.text(strings.status[5].status_listening.secondary);
        let i = 0;
        if (listeningInterval) {
            clearInterval(listeningInterval);
        }
        listeningInterval = setInterval(() => {
            i += 1;
            if (i === 2) {
                listeningInterval = undefined;
                this.statusActive();
            }
        }, 500)
    }

    statusVocsActivated() {
        this.textPrimary.text(strings.status[5].status_vocsactivated.primary);
        this.textPrimary.css('color', this.colorNormal);
        this.textSecondary.text(strings.status[5].status_vocsactivated.secondary);
        this.showLoading();
        let i = 0;
        if (listeningInterval) {
            clearInterval(listeningInterval);
        }
        listeningInterval = setInterval(() => {
            i += 1;
            if (i === 2) {
                listeningInterval = undefined;
                this.statusActive();
                this.hideLoading();
            }
        }, 500)
    }

    hideStatusText() {
        this.textPrimary.hide();
        this.textSecondary.hide();
    }

    showStatusText() {
        this.textPrimary.show(250);
        this.textSecondary.show(250);
    }

    setInputText(text) {
        this.textInputContainer.show(500);

        if (text.length > 100) {
            let limitedRecognitionText = text.slice(text.length - 35, text.length);
            this.textInput.text(limitedRecognitionText);
        } else {
            $(this.textInput).text(text);
        }

        let i = 0;
        if (inputTextInterval) {
            clearInterval(inputTextInterval);
        }
        inputTextInterval = setInterval(() => {
            i += 1;
            if (i === 5) {
                inputTextInterval = undefined;
                this.textInputContainer.hide(500);
            }
        }, 500)
    }
    fatalErrorOccured () {
        this.isReady = false;
        this.drawUI();
    }
}
function storageAvailable(type) {
    try {
        let storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        console.warn('Storage is not supported!!!');
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

function setLocalStorageItem(key, value) {
    localStorage.setItem(key, value);
}
function getLocalStorageItem(key) {
    return localStorage.getItem(key);
}
function setSessionStorageItem(key, value) {
    sessionStorage.setItem(key, value);
}
function getSessionsStorageItem(key) {
    return sessionStorage.getItem(key);
}


export let ui = new UI();

function dragElement(elmnt, container) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        elmnt.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        container.style.top = (container.offsetTop - pos2) + "px";
        container.style.left = (container.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        elmnt.onmouseup = null;
        elmnt.onmousemove = null;
    }
}