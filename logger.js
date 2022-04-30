
const winston = require('winston')

const myCustomLevels = {
    levels: {
        ERROR: 0,
        INFO: 1,
        SUCCESS: 2,
        WARNING: 3
    },
    colors: {
        ERROR: 'red',
        INFO: 'blue',
        SUCCESS: 'green',
        WARNING: 'yellow'
    }
};

module.exports = function () {
    const logger = winston.createLogger({
        level: 'WARNING',
        levels: myCustomLevels.levels,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({
                format: 'HH:mm:ss'
            }),
            winston.format.printf(info => `[ ${info.timestamp} ] ~ ${info.level}: ${info.message}`)
        ),
        transports: [new winston.transports.Console()]
    });

    winston.addColors(myCustomLevels.colors)

    return logger;
};