export default function speechRecognition() {

    $('#startRecord').click(function () {
        /*if (typeof (Storage) !== 'undefined') {
         console.log('audio value : ' + localStorage.getItem('audio'));
         if (localStorage.getItem('audio') == true) {
             runAudioContext();
             startAudioRecord();
             $('#startRecord').textContent = 'Stop';
             console.log('Audio settings stored');
        } else {
         console.log('Storage is undefined: ' + Storage);
        }*/

        if ($('#control-img').attr('src') === './images/play_icon.svg') {
            if (typeof (Storage) === undefined) {
                if (localStorage.getItem('audio') !== true) {
                    localStorage.setItem('audio', true);
                    console.log('Save audio settings');
                }
            }
            //recognition.start();
            runAudioContext();
            startAudioRecord();
            $('#control-img').attr('src', './images/stop_icon.svg');
        } else {
            stopAudioContext();
            $('#control-img').attr('src', './images/play_icon.svg');
        }
    });

    /**
     * Setup Web Audio API
     * */
    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let source;

//set up the different audio nodes we will use for the app
    let analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    let audioChunks = [];
    let rec;
    let isRecording = false;

    let distortion = audioCtx.createWaveShaper();
    let gainNode = audioCtx.createGain();
    let biquadFilter = audioCtx.createBiquadFilter();
    let convolver = audioCtx.createConvolver();

// set up canvas context for visualizer

    let canvas = document.querySelector('.visualizer');
    let canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    let drawVisual;

//main block for doing the audio recording
    function startAudioRecord() {
        console.log('Start Audio Record');
        if (navigator.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.getUserMedia(
                // constraints - only audio needed for this app
                {
                    audio: true
                },

                // Success callback
                function (stream) {
                    source = audioCtx.createMediaStreamSource(stream);
                    source.connect(analyser);
                    analyser.connect(distortion);
                    distortion.connect(biquadFilter);
                    biquadFilter.connect(convolver);
                    convolver.connect(gainNode);
                    gainNode.connect(audioCtx.destination);
                    visualize();
                    voiceMute();

                    rec = new MediaRecorder(stream);

                    rec.ondataavailable = e => {
                        audioChunks.push(e.data);
                    };
                    rec.onstop = function () {

                        isRecording = false;

                        if (audioChunks.length > 0) {
                            let audio = new Blob(audioChunks, {type: 'audio/wave'});
                            recordedAudio.src = URL.createObjectURL(audio);
                            recordedAudio.controls = true;
                            audioDownload.href = recordedAudio.src;
                            audioDownload.download = 'wave';
                            audioDownload.innerHTML = 'download';
                            audioChunks = [];
                        }
                    }
                },
                // Error callback
                function (err) {
                    console.log('The following gUM error occured: ' + err);
                }
            );
        } else {
            console.log('getUserMedia not supported on your browser!');
        }

        function visualize() {
            analyser.fftSize = 512;
            let bufferLength = analyser.fftSize;
            console.log(bufferLength);
            let dataArray = new Uint8Array(bufferLength);

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            let drawAlt = function () {
                drawVisual = requestAnimationFrame(drawAlt);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = '#f5f5f5';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

                canvasCtx.beginPath();

                let sliceWidth = WIDTH * 1.0 / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    let v = dataArray[i] / 128.0;
                    let y = v * HEIGHT / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth + 1;

                    if (barHeight >= 100) {
                        /*console.log('#####' + barHeight);*/
                        if (isRecording === false) {
                            console.log('...Starting recorder');
                            rec.start();
                            isRecording = true;
                            setTimeOut();
                        }
                    }
                }

                canvasCtx.lineTo(canvas.width, canvas.height / 2);
                canvasCtx.stroke();
            };
            drawAlt();
        }

    }

    function voiceMute() {
        gainNode.gain.value = 0;
    }

    function stopAudioContext() {
        //sendRequest();
        if (audioCtx.state === 'running') {
            audioCtx.suspend().then(function () {
                window.cancelAnimationFrame(drawVisual);
                canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
                canvasCtx.fillStyle = "transparent";
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
                console.log('AudioContext state: ' + audioCtx.state);
            });

        }
    }

    function runAudioContext() {
        if (audioCtx.state === 'suspended' || audioCtx.state === 'closed') {
            audioCtx.resume().then(function () {
                console.log('AudioContext state: ' + audioCtx.state);
            });
        }
    }

    /*function getAverageVolume(array) {
        let values = 0;
        let average;
        let length = array.length;
        // get all the frequency amplitudes
        for (let i = 0; i < length; i++) {
            values += array[i];
        }
        average = values / length;
        //console.log('AVArAGE:' + average);
        return average;
    }*/
}