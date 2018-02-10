import {performUserAction/*, provideSystemStatus*/} from './controller';
/**
 *  Setup Google Speech Recognition
 */
export default function setupWebSpeechRecognitionAPI(){
    try {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;
        recognition.start();

        recognition.onresult = function (event) {

            let recognitionResult = event.results[0][0].transcript;

            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            //provideSystemStatus('Listen', transcript);

            if (recognitionResult) {
                if (event.results[0].isFinal) {
                    //provideSystemStatus('You Say', recognitionResult);
                    console.warn(recognitionResult);
                    performUserAction(recognitionResult);
                }
            }

        };
        recognition.addEventListener('end', recognition.start);
        recognition.onerror = function (e) {
            console.error('Error on recognition: ');
            console.error(e);
        };
    }
    catch (e) {
        console.error('Web Speech error: ' + e);
    }
}