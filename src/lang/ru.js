export let keywords = [
    {vocs: ['вокс']},
    {click: ['кликать', 'нажать', 'навигировать', 'иди', 'к']},
    {off: ['выключить', 'деактивировать', 'систему']},
    {up: ['страница', 'верх','вверх', 'скролить']},
    {down: ['страница', 'низ','вниз', 'скролить']},
    {bottom: ['скролить', 'полностью', 'самый', 'низ', 'конец']}
    //TODO: and so on...
];

export let strings_status = [
    {
        status_noactive: {
            primary: 'System ist deaktiviert',
            secondary: 'Klicke den Startbutton'
        }
    },
    {
        status_active: {
            primary: 'System ist aktiviert',
            secondary: 'Sag Vocs um loszulegen'
        }
    },
    {
        status_error: {
            primary: 'Ein Fehler ist aufgetreten',
            secondary: 'Bitte aktualisiere die Seite'
        }
    },
    {
        status_nofound: {
            primary: 'Kein Element defunden',
            secondary: 'Please try again'
        }
    },
    {
        status_nosupport: {
            primary: 'Your browser is not supported',
            secondary: 'Please update your Browser'
        }
    },
    {
        status_listening: {
            primary: 'Listening...',
            secondary: ' '
        }
    },
    {
        status_vocsactivated: {
            primary: 'What can i do?',
            secondary: ''
        }
    }
];