import '../css/vocs_styles.css';

class UI {
    showUI() {
    }

    hideUI() {

    }

    drawUI() {
        let ui = $(`<div class="vocs_ui">Hello motherfucker</div>`);
        //$('body').append(ui);
    }

    showLoading() {

    }

    hideLoading() {

    }
}

export let ui = new UI();