export let keywords = [
    {click: ['click', 'press', 'navigate', 'go to']},
    {off: ['shut', 'system', 'vocs', 'off', 'down', 'deactivate']},
    {up: ['scroll', 'page', 'site','up']},
    {down: ['scroll', 'page', 'site', 'down']},
    {bottom: ['scroll', 'page', 'site', 'bottom', 'end']}
    //TODO: and so on...
    ]

export let strings_status = [
    {
        status_noactive: {
            primary: 'System is not active now',
            secondary: 'Click play to start'
        }
    },
    {
        status_active: {
            primary: 'System is active',
            secondary: 'Say Click to start'
        }
    },
    {
        status_error: {
            primary: 'Some error was occurred',
            secondary: 'Please reload the site'
        }
    },
    {
        status_nofound: {
            primary: 'No Element was found',
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
        status_clickactivated: {
            primary: 'What can i do?',
            secondary: ''
        }
    }
];