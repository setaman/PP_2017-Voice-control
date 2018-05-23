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
    },
    {
        status_listening: {
            primary: 'Listening...',
            secondary: ''
        }
    }
];

let inputTextInterval = null;
let logoRotationInterval = null;

let uiTemplate = $(
    `<div class="vocs_ui_container">
    <div class="vocs_ui">
        <div class="vocs_ui_control">
            <img class="vocs_ui_logo" src="./public/images/vocs_ui_logo.svg">
            <img class="vocs_ui_start_icon" src="./public/images/vocs_ui_start.svg">
            <span class="vocs_ui_live_icon"></span>
        </div>
        <div class="vocs_ui_info">
            <img src="./public/images/vocs_ui_menu.svg">
            <img src="./public/images/vocs_ui_menu.svg">
        </div>
        <div class="vocs_ui_display">
            <p class="vocs_ui_primary_text"></p>
            <p class="vocs_ui_secondary_text"></p>
        </div>
        <div class="vocs_ui_size">
            <img class="vocs_ui_min" src="./public/images/vocs_ui_min.svg">
            <img class="vocs_ui_resize" src="./public/images/vocs_ui_resize.svg">
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
console.log(strings.status[0].status_noactive.primary);

class UI {
    constructor() {
        this.isActive = false;
        this.isWaitingForVocs = true;
        this.startButton;
        this.startIcon;
        this.liveIcon;
        this.uiContainer;
        this.textPrimary;
        this.textSecondary;
        this.textInput;
        this.logo;
        this.icon;
        this.textInputContainer;
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
        this.uiContainer = $('.vocs_ui_container');
        this.startButton = $('.vocs_ui_control');
        this.startIcon = $('.vocs_ui_start_icon');
        this.liveIcon = $('.vocs_ui_live_icon');
        this.textPrimary = $('.vocs_ui_primary_text');
        this.textSecondary = $('.vocs_ui_secondary_text');
        this.textInput = $('.vocs_ui_input_text');
        this.logo = $('.vocs_ui_logo');
        this.textInputContainer = $('.vocs_ui_input');

        this.textInputContainer.hide();
        this.liveIcon.hide();

        this.startButton.click(() => {
            if (this.isActive) {
                this.isActive = false;
                this.liveIcon.hide(500);
                this.startIcon.show(500);
                this.statusNotActive();
            }else {
                this.isActive = true;
                this.statusActive();
                this.startIcon.hide(500);
                this.liveIcon.show(500);
            }
        });
    }

    showLoading() {
        this.logo.addClass('vocs_logo_rotation');
    }

    hideLoading() {
        $(this.logo).removeClass('vocs_logo_rotation');
    }

    statusNotActive() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[0].status_noactive.primary);
        this.textPrimary.css('color', 'white');
        this.textSecondary.text(strings.status[0].status_noactive.secondary);
        this.showStatusText();
    }

    statusActive() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[1].status_active.primary);
        this.textPrimary.css('color', 'green');
        this.textSecondary.text(strings.status[1].status_active.secondary);
        this.showStatusText();
    }

    statusError() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[2].status_error.primary);
        this.textPrimary.css('color', 'red');
        this.textSecondary.text(strings.status[2].status_error.secondary);
        this.showStatusText();
    }

    statusNoFound() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[3].status_nofound.primary);
        this.textPrimary.css('color', 'yellow');
        this.textSecondary.text(strings.status[3].status_nofound.secondary);
        this.showStatusText();
    }

    statusNoSupport() {
        this.hideStatusText();
        this.textPrimary.text(strings.status[4].status_nosupport.primary);
        this.textPrimary.css('color', 'red');
        this.textSecondary.text(strings.status[4].status_nosupport.secondary);
        this.showStatusText();
    }

    statusListening() {
        this.textPrimary.text(strings.status[5].status_listening.primary);
        this.textPrimary.css('color', 'white');
        this.textSecondary.text(strings.status[5].status_listening.secondary);
    }

    hideStatusText() {
        this.textPrimary.hide(250);
        this.textSecondary.hide(250);
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
}

export let ui = new UI();
