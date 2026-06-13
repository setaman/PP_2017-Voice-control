class Speaker {
    constructor() {
        this.voice = null;
        this.isReady = isSupported();
    }

    initSpeaker(lang = 'en-US') {
        if (this.isReady) {
            try {
                window.speechSynthesis.onvoiceschanged = () => {
                    this.voice = getVoice(lang);
                };
            } catch (e) {
                this.isReady = false;
                console.error(e);
            }
        }
    }

    speak(text) {
        if (this.isReady) {
            let utterance = new SpeechSynthesisUtterance(text);
            if (this.voice) {
                utterance.voice = this.voice;
                speechSynthesis.speak(utterance);
            }
        }
    }

}

function isSupported() {
    return 'speechSynthesis' in window ? true : console.error('speaker is not supported!!!');
}

function getVoice(lang) {
    let voices = speechSynthesis.getVoices();
    let voice = voices.filter(voice => voice.lang === lang)[0];
    return voice ? voice : voices.filter(voice => voice.default === true)[0];

}

export let speaker = new Speaker();