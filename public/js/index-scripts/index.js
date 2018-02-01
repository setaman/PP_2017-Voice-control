/*
    Test Script für Index - Seite, zum Test des System - APIs
 */
import Vocs from '../vocs';

window.onload = function () {
    let vocs = new Vocs({
        recognizer: 'houndify',
        apiId: '0',
        apiKey:'0',
        ui: true
    }).initRecognizer();
};

