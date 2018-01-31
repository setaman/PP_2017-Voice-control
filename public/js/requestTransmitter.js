
export function sendAudioToServer(d) {
        $.ajax({
            host: 'localhost',
            port: '3000',
            data: d,
            dataType: 'text',
            url: '/recognizer',
            type: 'POST',
        }).done(function (data) {
            console.dir('Server Response: ' + data);
        }).fail(function (jqXHR, errorMessage, error) {
            console.log('AJAx error: ' + error);
        });
}