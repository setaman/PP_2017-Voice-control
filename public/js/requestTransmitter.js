
export function sendAudioToServer(audio) {
        $.ajax({
            host: 'localhost',
            port: '3000',
            /*data: JSON.stringify(audio),*/
            dataType: 'text',
            url: '/test',
            type: 'POST',
        }).done(function (data) {
            serverResponse = data;
            alert('Server Response: ' + data);
            console.log(data);
        }).fail(function (jqXHR, errorMessage, error) {
            console.log('AJAx error: ' + error);
        });
}