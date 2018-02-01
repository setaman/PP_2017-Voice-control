let analyser;
let rec;
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
                    let audioChunks = [];

                    console.log('Start Audio Record');
                    source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    gainNode.gain.value = 0;

                    rec = new MediaRecorder(stream);

                    rec.ondataavailable = e => {
                        audioChunks.push(e.data);
                    };
                    rec.onstop = function () {
                        if (audioChunks.length > 0) {
                            let audio = new Blob(audioChunks, {type: 'audio/wave'});
                            sendAudioToServer(audio);
                            recordedAudio.src = URL.createObjectURL(audio);
                            recordedAudio.controls = true;
                            audioDownload.href = recordedAudio.src;
                            audioDownload.download = 'wave';
                            audioDownload.innerHTML = 'download';
                            audioChunks = [];
                        }
                    };

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
            console.log(this.responseText);
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
            if (rec.state === 'inactive' || rec.state === 'paused') {
                console.log('...Starting recorder');
                rec.start();
                //isRecording = true;
                setTimeOut();
            }
        }
    };
    detectSound();
}

function setTimeOut() {
    setTimeout(function () {
        if (rec.state === 'recording')
            rec.stop();
        console.log('...Stopping recorder');
    }, 2500);

}






