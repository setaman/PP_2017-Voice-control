import '../css/vocs_styles.css';

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
            primary: 'Your browser is no supported',
            secondary: 'Please update your Browser'
        }
    }
];

let uiTemplate = $(
    `<div class="vocs_ui_container">
    <div class="vocs_ui">
        <div class="vocs_ui_control">
            <img class="vocs_ui_logo" src="./public/images/vocs_ui_logo.svg">
            <img class="vocs_ui_icon" src="./public/images/vocs_ui_start.svg">
        </div>
        <div class="vocs_ui_info">
            <img src="./public/images/vocs_ui_menu.svg">
            <img src="./public/images/vocs_ui_menu.svg">
        </div>
        <div class="vocs_ui_display">
            <p class="vocs_ui_primary_text">Your browser is not supported</p>
            <p class="vocs_ui_secondary_text">Please update your browser</p>
        </div>
        <div class="vocs_ui_size">
            <img class="vocs_ui_min" src="./public/images/vocs_ui_min.svg">
            <img class="vocs_ui_resize" src="./public/images/vocs_ui_resize.svg">
        </div>
    </div>
    <div class="vocs_ui_input">
        <p class="vocs_ui_input_text">Your browser is not supported</p>
    </div>
  
</div>`);

let strings = {
    status: []
};
strings.status.push(...string_status_en);
console.log(strings);

class UI {
    constructor() {
        this.isActive = false;
        this.uiContainer = $('vocs_ui_container');
        this.textPrimary = $('vocs_ui_primary_text');
        this.textSecondary = $('vocs_ui_secondary_text');
        this.textInput = $('vocs_ui_input_text');
        this.logo = $('vocs_ui_logo');
        this.icon = $('vocs_ui_icon');
    }

    showUI() {
        $(this.uiContainer).show(500);
    }

    hideUI() {
        $(this.uiContainer).hide(500);
    }

    minimizeUI() {

    }

    drawUI() {
        $('body').append(uiTemplate);
    }

    showLoading() {
        $(this.logo).addClass('rotation');
    }

    hideLoading() {
        $(this.logo).removeClass('rotation');
    }

    statusNoActive() {
        $(this.textPrimary).text(strings.status[0].primary);
        $(this.textSecondary).text(strings.status[0].secondary);
    }

    statusActive() {

    }

    statusError() {

    }

    statusNoFound() {

    }

    statusNoSupport() {

    }

    setInputText() {

    }
}

export let ui = new UI();