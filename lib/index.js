import program from 'commander';
import express from './express';
import info from '../package.json';
import {addTag, deploy} from './client';
import logger from './logger';
import utils from './utils';

program.version(info.version);

program
  .command('start')
  .description('start the bulldozer on your server')
  .action(cmd => {
    logger.info('I am going to start the bulldozer server.');
    express(getConfig(), cmd);
  });

program
  .command('deploy [tag]')
  .description('deploy the most recent tag (if not specified) to your server')
  .action(tag => deploy(process.cwd(), tag, getConfig()));

program
  .command('tag')
  .description('add and push a deploy (YYYYMMDD.V) tag to the current commit')
  .action(() => addTag(process.cwd(), getConfig()));


program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function getConfig() {
  try {
    const config = require(process.cwd() + '/bulldozer.js');
    utils.setOnError(config.onError);
    const check = ['onError', 'url', 'port', 'secret', 'name', 'gitUrl', 'preDeploy', 'postDeploy'].every(field => {
      if (config[field]) {
        return true;
      }
      logger.error(`./bulldozer.js config is missing the '${field}' field.`);
      return false;
    });

    if (!check) {
      return null;
    }

    logger.info('Bulldozer.js configuration found and used.');
    return config;
  } catch (error) {
    logger.error(`There is a problem with loading bulldozer.js. (${error})`);
    return null;
  }
}
