// Created by xander on 9/3/2018

const winston = require('winston');

// Create Logger
// colorize the output to the console
export const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ colorize: true })
    ],
});
