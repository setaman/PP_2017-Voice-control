import startRecord from './recorder'
import setupWebSpeechRecognitionAPI from './webspeech'
/**
 * Die Vocs Klasse stellt das API des Systems dar.
 */
export default class Vocs {
    constructor ({recognizer = 'default'}){
        this.options = {
            recognizer: recognizer
        };
    }
    initRecognizer(){
        if (this.options.recognizer === 'default'){
            setupWebSpeechRecognitionAPI();
        }else{
            startRecord(this.options.recognizer);
        }
    }
}