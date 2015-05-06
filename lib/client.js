import {spawn} from 'child_process';
import {Repository, Tag} from 'nodegit';
import moment from 'moment';
import request from 'request';
import {md5} from './utils';
import logger from './logger';

export function addTag(repoDir, branchName = 'master') {
  logger.info(`I'm going to create a new tag ${tagName} on the branch ${branchName}.`);
  Repository.open(repoDir).then(repo => {
    repo.getBranchCommit(branchName).then(commit => {
      const tagName = 'r' + moment().format('YYYYMMDDHHmmss');
      repo.createLightweightTag(commit.id(), tagName).then(ref => {
        logger.info(`The tag has been created! Now you can do 'git push --tags' and 'bulldozer deploy'.`);
      });
    });
  }).catch(error => {
    if (error) {
      logger.error(`I was trying to work with a repository at ${repoDir}. (${error})`);
    }
  });
}

export function deploy(repoDir, tag, config) {
  if (!config) {
    return;
  }
  Repository.open(repoDir).then(repo => {
    if (tag) {
      Tag.list(repo).then(tags => {
        if (tags.indexOf(tag) !== -1) {
          sendReq(tag, config);
        } else {
          logger.error(`Tag ${tag} does not exist!`);
        }
      });
    } else {
      Tag.list(repo).then(tags => {
        sendReq(tags.filter(tag => RegExp('^r[0-9]{14}').test(tag)).sort().pop(), config);
      });
    }
  }).catch(error => {
    if (error) {
      logger.error(`I was trying to work with a repository at ${repoDir}. (${error})`);
    }
  });
}

function sendReq(tag, config) {
  logger.info(`I am going to deploy tag ${tag}.`);
  const url = config.url.replace(/\/$/, "")
              + ':'
              + config.port
              + '/deploy/'
              + tag
              + '/?secret='
              + encodeURI(md5(config.secret));

  request.get(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      logger.info('Server says: ' + JSON.parse(body).message);
    } else {
      logger.error('Server says: ' + JSON.parse(body).message);
    }
  });

}
