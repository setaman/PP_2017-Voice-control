import startRecord from './recorder';
import setupWebSpeechRecognitionAPI from './webspeech';
/**
 * Die Vocs Klasse stellt das API des Systems dar.
 */
export default class Vocs {
    static initRecognizer({recognizer = 'default'}){
        let options = {
            recognizer: recognizer
        };
        if (options.recognizer === 'default'){
            setupWebSpeechRecognitionAPI();
        }else{
            startRecord(options.recognizer);
        }
    }
}