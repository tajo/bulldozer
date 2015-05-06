import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import request from 'request';
import path from 'path';
import utils from './utils';
import logger from './logger';

const TEMP_ZIP = './_bulldozer_temp.zip';
const TEMP_DIR = './_bulldozer_temp';

export default function deploy(url, config) {
  logger.info(`Deploying from ${url}.`);
  let file = null;
  try {
    file = fs.createWriteStream(TEMP_ZIP);
  } catch (error) {
    logger.error(`Can't create a temporary zip file. (${error})`);
    return;
  }

  let req = null;
  if (config.auth && config.auth.username && config.auth.password) {
    logger.info('Using HTTP authentication.');
    req = request(url).auth(config.auth.username, config.auth.password).pipe(file);
  } else {
    req = request(url).pipe(file);
  }
  req.on('error', err => {
    logger.error(err);
  });
  req.on('finish', () => file.close(() => unzipAndCopy(config)));
}

function unzipAndCopy(config) {
  logger.info('File (tag archive) downloaded. I am going to unzip it.');
  try {
    const zip = new AdmZip(TEMP_ZIP);
    zip.extractAllTo(TEMP_DIR);
  } catch (error) {
    logger.error(
      `Unzipping failed.
       Did you push tags to the remote server?
       If a private repository, did you set the username and password?
       (${error})`
    );
    return;
  }
  logger.info(`Unzipping was successfull.`);
  fs.remove(TEMP_ZIP);

  fs.readdirSync(TEMP_DIR).forEach(file => {
    if (fs.lstatSync(path.resolve(TEMP_DIR, file)).isDirectory()) {
      fs.copy(path.resolve(TEMP_DIR, file), './', err => {
        if (err) {
          logger.error(err);
          return false;
        }
        logger.info('Files successfully moved.');
        fs.remove(TEMP_DIR);
        config.postDeploy(utils);
      });
      return false;
    }
  });
}
