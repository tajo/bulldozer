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
  const file = fs.createWriteStream(TEMP_ZIP);
  let req = null;
  if (config.auth && config.auth.username && config.auth.password) {
    logger.info('Using HTTP authentication.');
    req = request(url).auth(config.auth.username, config.auth.password).pipe(file);
  } else {
    req = request(url).pipe(file);
  }
  req.on('error', err => logger.error(err));
  req.on('finish', () => file.close(() => unzipAndCopy(config)));
}

function unzipAndCopy(config) {
  logger.info('File (tag archive) downloaded. I am going to unzip it.');
  const zip = new AdmZip(TEMP_ZIP);

  try {
    zip.extractAllTo(TEMP_DIR);
  } catch (error) {
    logger.error(`Unzipping failed. (${error})`);
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
        if (config.postDeploy) {
          config.postDeploy(utils);
        }
      });
      return false;
    }
  });
}
