'use strict';

const commands = require('./commands');

commands.initial()
    .catch(console.error);
