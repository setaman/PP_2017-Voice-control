import startRecord from './recorder';
import setupWebSpeechRecognitionAPI from './webspeech';
/**
 * Die Vocs Klasse stellt das API des Systems dar.
 */
export default class Vocs {
    static initRecognizer({api = 'default'}){
        let options = {
            api: api
        };
        if (options.api === 'default'){
            setupWebSpeechRecognitionAPI();// Web Speech API wird initialisiert
        }else{
            startRecord(options.api);//Web Audio API wird initialisiert
        }
    }
}