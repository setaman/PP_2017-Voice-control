import startRecord from './recorder'
/**
 * Die Vocs Klasse stellt das API des Systems dar.
 */
export default class Vocs {
    constructor (options){
        this.options = options;
    }
    initRecognizer(){
        let {recognizer, ui} = this.options;
        if (recognizer === 'google'){
            //intiGoogle();
        }else{
            startRecord();
        }

        if (ui){
            //setUpUi();
        }
    }
    show(msg) {
        let {recognizer, ui} = this.options;
        console.log(msg + ' ' + recognizer + ' ' + ui);
    }
}