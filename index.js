'use strict';

const commands = require('./commands');
const logging = require('./tools/logging');

const run = ([command, ...args]) => {
    const logger = logging.create('Librarian');
    command = getCommand(command);

    if (command) {
        commands[command].apply(null, args)
            .catch((error) => logger.error(error));
    }
};

const getCommand = (command) => {
    switch (command) {
        case 'c':
        case 'comp':
        case 'component':
            return 'component';
        case 'i':
        case 'init':
        case 'initial':
        case 'initialize':
            return 'initial';
    }
};

run(process.argv.slice(2));
