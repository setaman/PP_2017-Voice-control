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

let strings = [];
strings.push(...string_status_en);
console.log(strings);

class UI {

    showUI() {
    }

    hideUI() {

    }

    drawUI() {
        let ui = $(
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
    </div>
    <div class="vocs_ui_input">
        <p class="vocs_ui_input_text">Your browser is not supported</p>
    </div>
</div>`);
        $('body').append(ui);
    }

    showLoading() {

    }

    hideLoading() {

    }

    statusNoActive(){

    }
    statusActive(){

    }
    statusError(){

    }
    statusNoFound(){

    }
    statusNoSupport(){

    }
}

export let ui = new UI();