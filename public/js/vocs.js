import statrtRecord from './recorder'
import setupWebSpeechRecognitionAPI from './webspeech'
/**
 * Die Vocs Klasse stellt das API des Systems dar.
 */
export default class Vocs {
    constructor (options){
        this.options = options;
    }
    initRecognizer(){
        let {recognizer, ui} = this.options;
        if (recognizer === 'default'){
            setupWebSpeechRecognitionAPI();
        }else{
            startRecord();
        }

        if (ui){
            //setUpUi();
        }
    }
}