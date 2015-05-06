import {exec} from 'child-process-promise';
import {createHash} from 'crypto';
import logger from './logger';

export default new class Utils {

  constructor() {
    this.loggerOutput = '';
    this.onError = null;
    logger.on('logging', (transport, level, msg, meta) => {
      if (level === 'error') {
        if (transport.name === 'error-console') {
          this.loggerOutput += level + ': ' + msg + '\n';
        }
      } else {
        this.loggerOutput += level + ': ' + msg + '\n';
      }

      if (transport.name === 'error-console' && level === 'error' && this.onError) {
        this.onError(this);
      }
    });
  }

  run(command) {
    logger.info(`Running command '${command}'`);
    return exec(command)
      .then(result => {
        logger.info(`Command '${command}' std output: ` + result.stdout);
        if (result.stderr) {
          logger.info(`Command '${command}' error output: ` + result.stderr);
        }
        logger.info(`Finished command '${command}'`);
      });
  }

  getLogger() {
    return logger;
  }

  getLoggerOutput() {
    return this.loggerOutput;
  }

  resetLoggerOutput() {
    this.loggerOutput = '';
  }

  setOnError(func) {
    this.onError = func;
  }

};

export function md5(input) {
  return createHash('md5').update(input).digest('hex');
}
