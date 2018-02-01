let express = require('express');
let app = express();

let houndifyExpress = require('houndify').HoundifyExpress;
app.get('/textSearchProxy', houndifyExpress.createTextProxyHandler());

// Streams 8/16 kHz mono 16-bit little-endian PCM samples
// in Int16Array chunks to backend
module.exports.doRequest = function (req, res) {

    let voiceRequest = new Houndify.VoiceRequest({
        // Your Houndify Client ID
        clientId: "g2BMnR9Hyjv0f9i0hbu11w==",

        authURL: "/houndifyAuth",

        // Request Info JSON
        // See https://houndify.com/reference/RequestInfo
        requestInfo: {
            UserID: "vocs",
        },

        // Pass the current ConversationState stored from previous queries
        // See https://www.houndify.com/docs#conversation-state
        conversationState: conversationState,

        // Sample rate of input audio
        sampleRate: 16000,

        // Enable Voice Activity Detection, default: true
        enableVAD: false,

        // Partial transcript, response and error handlers
        onTranscriptionUpdate: function (transcipt) {
            console.log("Partial Transcript:", transcipt.PartialTranscript);
        },

        onResponse: function (response, info) {
            console.log(response);
            if (response.AllResults && response.AllResults.length) {
                // Pick and store appropriate ConversationState from the results.
                // This example takes the default one from the first result.
                conversationState = response.AllResults[0].ConversationState;
            }

            res.send({
                success: true,
                string: response
            });
        },

        onError: function (err, info) {
            res.send({
                success: false,
                string: null
            });
            console.log(err);
        }
    });

    let arrayBuffer = new Uint8Array(req.audioData).buffer;
    let audio = new Int16Array(arrayBuffer);

    voiceRequest.write(audio);

    voiceRequest.end();

// Ends streaming voice search requests, expects the final response from backend
    voiceRequest.end();

// Aborts voice search request, does not expect final response from backend
    voiceRequest.abort();
};