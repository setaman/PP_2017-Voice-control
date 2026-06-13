let analyser;
let recorder;
let isRecording = false;
import './_recorder.js';
const Recorder = window.Recorder;
//import performUserAction from './controller';

export default function startRecord() {

    //set up Web Speech API
    try {
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        if (!navigator.getUserMedia) {
            console.log('getUserMedia is not implemented in this browser');
        } else {
            //Nur Audio wird aufgenommen
            navigator.getUserMedia({audio: true},
                function (stream) {
                    //AudioContext wird initialisiert
                    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    //Processing Nodes
                    let gainNode = audioContext.createGain();
                    analyser = audioContext.createAnalyser();
                    let source;

                    console.log('Start Audio Record');
                    //Audioquelle - Mikrofon
                    source = audioContext.createMediaStreamSource(stream);
                    //Nodes verbinden
                    source.connect(analyser);
                    analyser.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    // Lautstärke auf 0 setzen, damit die Aufnahme nicht ausgegeben wird
                    gainNode.gain.value = 0;
                    //Recorder Library
                    recorder = new Recorder(source);
                    //Detect Sound
                    watchForSound();

                }, function (err) {
                    console.log('The following getUserMedia error occurred: ' + err);
                }
            );
        }
    } catch (e) {
        console.error(e);
    }
}

/**
 * Audio an Server Senden
 * @param audio - Binärdatei
 */
function sendAudioToServer(audio) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState === 4) {
            try {
                console.log(/*JSON.parse(*/this.responseText/*)*/);
                //performUserAction(this.responseText);
            } catch (e) {
                console.error('Error by retrieving JSON: ' + e);
            }
        }
    };
    xhr.open("POST", "http://localhost:3000/audio", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.send(audio);
}

/**
 * Aufnahme wird anhand der Frequenz detected (alpha-Version)
 * */
function watchForSound() {
    let detectSound = function () {
        requestAnimationFrame(detectSound);
        analyser.fftSize = 256;
        let freqBufferLength = analyser.frequencyBinCount;
        let freqDataArray = new Uint8Array(freqBufferLength);
        analyser.getByteFrequencyData(freqDataArray);
        let freq = freqDataArray[0];
        if (freq >= 200) {
            if (!isRecording) {
                isRecording = !isRecording;
                console.log('...Starting recorder');
                //Audio wird aufgenommen
                recorder.record();
                setTimeOut();
            }
        }
    };
    detectSound();
}

function setTimeOut() {
    window.setTimeout(function () {
        if (isRecording) {
            isRecording = !isRecording;
            stopRecorder();
            console.log('...Stopping recorder');
        }
    }, 2000);
}
/**
 * Recorder stopen und WAVE-Datei speichern
 */
function stopRecorder() {
    recorder.stop();
    recorder.exportWAV(function (audio) {
        recordedAudio.src = URL.createObjectURL(audio);
        recordedAudio.controls = true;
        audioDownload.href = recordedAudio.src;
        audioDownload.download = 'wave';
        audioDownload.innerHTML = 'download';
        console.log(audio);
        //Datei an Server senden
        sendAudioToServer(audio);
        recorder.clear();
    });
}