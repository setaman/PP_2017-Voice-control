let request = require("request");

/**
 * HTTP Request an Microsoft ASR, beispielhaft
 */
module.exports.doRequest = function (req, res) {

    let audio = req.body;
    //console.log(audio);
    let options = {
        method: 'POST',
        json: true,
        url: 'https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US&format=detailed',
        headers:
            {
                'Cache-Control': 'no-cache',
                Accept: 'application/json;text/xml',
                'Transfer-Encoding': 'chunked',
                Host: 'speech.platform.bing.com',
                'Ocp-Apim-Subscription-Key': 'd3982e6ce0c54fef8e0fd89d4b9c0584',
                'Content-Type': 'audio/wav; codec=audio/pcm; samplerate=16000'
            },
        body: audio
    };

    request(options, function (error, response, body) {
        if (error) {
            console.log(response.statusCode);
            console.log(error);
            res.json({
                success: false,
                string: ''
            });
            throw new Error(error);
        } else {
            console.log(body);
            switch (response.statusCode) {
                case 200:
                    res.json({
                        success: true,
                        string: body
                    });
                    break;
                case 400:
                    res.json({
                        success: false,
                        string: response.statusCode
                    });
                    break;
                case 404:
                    res.json({
                        success: false,
                        string: response.statusCode
                    });
                    break;
                case 500:
                    res.json({
                        success: false,
                        string: response.statusCode
                    });
                    break;
                default:
                    res.json({
                        success: false,
                        string: response.statusCode
                    });
            }
        }

    });
};