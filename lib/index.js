import program from 'commander';
import express from './express';
import info from '../package.json';

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
  .description('deploy to your server')
  .action(cmd => console.log('deploy command'));

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function getConfig() {
  try {
    const config = require(process.cwd() + '/bulldozer.js');
    console.log('Using bulldozer.js configuration...');
    return config;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('The bulldozer.js file was not found. Cannnot continue!');
    } else {
      console.log(error);
    }
    return null;
  }
}


