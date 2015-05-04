import program from 'commander';
import express from './express';
import info from '../package.json';
import {addTag, deploy} from './client';

program.version(info.version);

program
  .command('start')
  .description('start the bulldozer on your server')
  .action(cmd => {
    console.log('start command');
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

function getConfig(printInfo = true) {
  try {
    const config = require(process.cwd() + '/bulldozer.js');
    if (printInfo) {
      console.log('Using bulldozer.js configuration...');
    }
    return config;
  } catch (error) {
    console.log(error);
    if (printInfo) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log('The configuration bulldozer.js file was not found. Cannot continue!');
      } else {
        console.log(error);
      }
    }
    return null;
  }
}


