import {performUserAction, provideSystemStatus} from './controller';
import {fuzzySearchForVocs} from './fuzzy_search';
/**
 *  Setup Google Speech Recognition
 */
export default function setupWebSpeechRecognitionAPI(){
    try {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        let words = ['vocs'];
        let grammar = '#JSGF V1.0; grammar actions; public <actions> = ' + words.join(' | ') + ';';

        let speechRecognitionList = new webkitSpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;

        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.start();

        recognition.onresult = event => {

            let recognitionResult = event.results[0][0].transcript;

            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            provideSystemStatus('Listen', transcript);

            if (recognitionResult) {
                if (event.results[0].isFinal) {
                    provideSystemStatus('You Say', recognitionResult);
                    console.warn(fuzzySearchForVocs(recognitionResult));
                    console.warn(recognitionResult);
                    performUserAction(recognitionResult);
                }
            }

        };
        recognition.addEventListener('end', recognition.start);
        recognition.onerror = e => {
            if(e.error === 'no-speech'){return;}
            console.error('Error on recognition: ');
            console.error(e);
        };
    }
    catch (e) {
        console.error('Web Speech error: ' + e);
    }
}