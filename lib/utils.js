import {exec} from 'child-process-promise';
import {createHash} from 'crypto';
import logger from './logger';

export default new class Utils {

  constructor() {
    this.loggerOutput = '';
    logger.on('logging', (transport, level, msg, meta) => {
      this.loggerOutput += level + ': ' + msg + '\n';
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
      })
      .fail(err => {
        logger.error(err);
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

};

export function md5(input) {
  return createHash('md5').update(input).digest('hex');
}
