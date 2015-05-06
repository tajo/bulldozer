import program from 'commander';
import express from './express';
import info from '../package.json';
import {addTag, deploy} from './client';
import logger from './logger.js';

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
  .action(() => addTag(process.cwd(), getConfig().branch));


program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function getConfig() {
  try {
    const config = require(process.cwd() + '/bulldozer.js');
    logger.info('Bulldozer.js configuration found and used.');
    return config;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      logger.error('The configuration bulldozer.js file was not found. Cannot continue!');
    } else {
      logger.error(`ERROR: ${error}`);
    }
    return null;
  }
}


