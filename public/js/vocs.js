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
            setupWebSpeechRecognitionAPI();
        }else{
            startRecord(options.api);
        }
    }
}