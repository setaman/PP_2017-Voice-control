let request = require('request');

module.exports.doRequest = function (req, res) {
    request({
        url: ' https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US&format=detailed',
        headers: {
            'Ocp-Apim-Subscription-Key': 'd3982e6ce0c54fef8e0fd89d4b9c0584',
            'Content-Type': "audio/wav; codec=audio/pcm; samplerate=16000",
            'Host': "speech.platform.bing.com",
            'Host': "speech.platform.bing.com"
        },
        method: 'post',
        body: "hey"
    }, function (err, resp, body) {
        //body will contain the JSON response
        console.log(body);
        res.send({
            success: true,
            string: body
        });

    });

};

/*
let express = require('express');
let app = express();
let Houndify = require('houndify');
let bodyParser = require('body-parser');

/!*
let houndifyExpress = require('houndify').HoundifyExpress;
*!/
app.get('/houndifyAuth', Houndify.HoundifyExpress.createAuthenticationHandler({
    clientId: "g2BMnR9Hyjv0f9i0hbu11w==",
    clientKey: "14DCe9azAg4LLfBDntzNHf_8NMDtBjozo2v3LMPFA0wE1rLeEEKeaOzUChc8IL_-byyhWrM0-ZvKcUP3paov9A=="
}));
app.post('/textSearchProxy', bodyParser.text({limit: '1mb'}), Houndify.HoundifyExpress.createTextProxyHandler());

module.exports.doRequest = function (req, res) {

    console.log(req.body);

    let voiceRequest = new Houndify.VoiceRequest({
        // Your Houndify Client ID
        clientId: "g2BMnR9Hyjv0f9i0hbu11w==",
        clientKey: "14DCe9azAg4LLfBDntzNHf_8NMDtBjozo2v3LMPFA0wE1rLeEEKeaOzUChc8IL_-byyhWrM0-ZvKcUP3paov9A==",

        authURL: "/houndifyAuth",

        // Request Info JSON
        // See https://houndify.com/reference/RequestInfo
        requestInfo: {
            UserID: "vocs",
        },
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
                string: response,
                info: info
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
    let arrayBuffer = new Uint8Array(req.body).buffer;
    let audio = new Int16Array(arrayBuffer);
    voiceRequest.write(audio);
    voiceRequest.end();

};*/
