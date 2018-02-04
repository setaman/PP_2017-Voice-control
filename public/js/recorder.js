let analyser;
let recorder;
let isRecording = false;
import Recorder from './_recorder_';
import performUserAction from './controller';

export default function startRecord() {

    try {
        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        if (!navigator.getUserMedia) {
            console.log('getUserMedia is not implemented in this browser');
        } else {
            navigator.getUserMedia({audio: true},
                function (stream) {

                    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    let gainNode = audioContext.createGain();
                    analyser = audioContext.createAnalyser();
                    let source;

                    console.log('Start Audio Record');
                    source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    gainNode.gain.value = 0;

                    recorder = new Recorder(source);

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

function sendAudioToServer(audio) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (this.readyState === 4) {
            try {
                console.log(JSON.parse(this.responseText));
                //performUserAction(this.responseText);
            } catch (e) {
                console.error('Error by retrieving JSON: ' + e);
            }
        }
    };
    xhr.open("POST", "http://localhost:3000/recognizer", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.send(audio);
}

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

function stopRecorder() {
    recorder.stop();
    recorder.exportWAV(function (audio) {
        recordedAudio.src = URL.createObjectURL(audio);
        recordedAudio.controls = true;
        audioDownload.href = recordedAudio.src;
        audioDownload.download = 'wave';
        audioDownload.innerHTML = 'download';
        console.log(audio);
        sendAudioToServer(audio);
    });
}






