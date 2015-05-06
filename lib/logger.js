import winston from 'winston';

export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      name: 'info-console',
      colorize: true,
      level: 'info'
    }),
    new (winston.transports.Console)({
      name: 'error-console',
      colorize: true,
      level: 'error'
    })
  ],
  exitOnError: false
});
