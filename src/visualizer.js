/**
 * **********************************************
 * Nicht Projektrelevant                       **
 * **********************************************
 */
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

let distortion = audioCtx.createWaveShaper();
let gainNode = audioCtx.createGain();
let biquadFilter = audioCtx.createBiquadFilter();
let convolver = audioCtx.createConvolver();

// set up canvas context for visualizer
let canvas;
let canvasCtx;
let WIDTH;
let HEIGHT;
let drawVisual;

//main block for doing the audio visualization
export function startVisualization() {
    runAudioContext();
    if (navigator.getUserMedia) {
        navigator.getUserMedia(
            // constraints - only audio needed for this app
            {
                audio: true
            },
            // Success callback
            (stream) => {
                source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.connect(distortion);
                distortion.connect(biquadFilter);
                biquadFilter.connect(convolver);
                convolver.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                drawVisualization();
                voiceMute();
            },
            // Error callback
            (err) => {
                console.log('The following gUM error occured: ' + err);
            }
        );
    } else {
        console.log('getUserMedia not supported on your browser!');
    }

    function drawVisualization() {

        // set up canvas context for visualizer
        canvas = document.querySelector('.vocs_visualizer');
        canvasCtx = canvas.getContext("2d");
        WIDTH = canvas.width;
        HEIGHT = canvas.height;


        analyser.fftSize = 512;
        let bufferLength = analyser.fftSize;
        let dataArray = new Uint8Array(bufferLength);

        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        let drawAlt = function () {
            drawVisual = requestAnimationFrame(drawAlt);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.fillStyle = 'transparent';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

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

export function stopVizualization() {
    if (audioCtx.state === 'running') {
        audioCtx.suspend().then(() => {
            window.cancelAnimationFrame(drawVisual);
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            console.log('AudioContext state: ' + audioCtx.state);
        });

    }
}

export function runAudioContext() {
    if (audioCtx.state === 'suspended' || audioCtx.state === 'closed') {
        audioCtx.resume().then(() => {
            console.log('AudioContext state: ' + audioCtx.state);
        });
    }
}