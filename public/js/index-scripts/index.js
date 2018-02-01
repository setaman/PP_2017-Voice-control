/*
    Test Script für Index - Seite, zum Test des System - APIs
 */
import Vocs from '../vocs';

window.onload = function () {
    console.log(window.Vocs);
    let vocs = new Vocs({
        recognizer: 'default',
        apiId: '0',
        apiKey:'0',
        ui: true
    }).initRecognizer();
};

