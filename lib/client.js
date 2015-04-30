import {spawn} from 'child_process';
import {Repository, Tag} from 'nodegit';
import moment from 'moment';
import request from 'request';

export function addTag(repoDir, branchName = 'master') {
  Repository.open(repoDir).then(repo => {
    repo.getBranchCommit(branchName).then(commit => {
      const tagName = 'r' + moment().format('YYYYMMDDHHmmss');
      repo.createLightweightTag(commit.id(), tagName).then(ref => {
        console.log(`New tag ${tagName} created. It points to the newest commit of branch ${branchName}.`);
      });
    });
  }).catch(error => {
    if (error) {
      console.log(`Looked for a repository in ${repoDir}.`);
      console.log(`Error while opening the repo: ${error}`);
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
          console.log(`ERROR: Tag ${tag} does not exist!`);
        }
      });
    } else {
      Tag.list(repo).then(tags => {
        sendReq(tags.filter(tag => RegExp('^r[0-9]{14}').test(tag)).sort().pop(), config);
      });
    }
  }).catch(error => {
    if (error) {
      console.log(`Looked for a repository in ${repoDir}.`);
      console.log(`Error while opening the repo: ${error}`);
    }
  });
}

function sendReq(tag, config) {
  const url = config.url.replace(/\/$/, "")
              + ':'
              + config.port
              + '/deploy/'
              + tag
              + '/?secret='
              + encodeURI(config.secret);

  request.get(url, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body).message);
    } else {
      console.log(`Error: ${error}`);
      if (body) {
        console.log(body.message);
      }
    }
  });

}
