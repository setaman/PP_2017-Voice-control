/*
    Test Script für Index - Seite, zum Test des System - APIs
 */
import Vocs from '../vocs';
let vocs = new Vocs({
    recognizer: 'google',
    ui: true
}).show('huez');
console.log('hello from index');
