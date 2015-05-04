import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import request from 'request';
import path from 'path';

const TEMP_ZIP = './_bulldozer_temp.zip';
const TEMP_DIR = './_bulldozer_temp';

export default function deploy(url, config) {
  console.log(`Deploying from ${url}:`);
  console.log(`======================`);

  const file = fs.createWriteStream(TEMP_ZIP);

  let req = null;
  if (config.auth && config.auth.username && config.auth.password) {
    console.log('Using HTTP authentication.');
    req = request(url).auth(config.auth.username, config.auth.password).pipe(file);
  } else {
    req = request(url).pipe(file);
  }
  req.on('error', err => console.log(err));
  req.on('finish', () => file.close(() => unzipAndCopy(config)));
}

function unzipAndCopy(config) {
  console.log('file downloaded, unziping...');
  const zip = new AdmZip(TEMP_ZIP);

  zip.extractAllTo(TEMP_DIR);
  fs.remove(TEMP_ZIP);

  fs.readdirSync(TEMP_DIR).forEach(file => {
    if (fs.lstatSync(path.resolve(TEMP_DIR, file)).isDirectory()) {
      fs.copy(path.resolve(TEMP_DIR, file), './', err => {
        if (err) {
          console.log(err);
          return false;
        }
        console.log('Files moved.');
        fs.remove(TEMP_DIR);
        if (config.postDeploy) {
          config.postDeploy();
        }
      });
      return false;
    }
  });
}
