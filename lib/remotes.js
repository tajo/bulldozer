import logger from './logger';

export default function getRemote(remote, name, tag) {
  const lowerRemote = remote.toLowerCase();
  if (lowerRemote === 'github') {
    return 'https://github.com/' + name + '/archive/' + tag + '.zip';
  } else if (lowerRemote === 'bitbucket') {
    return 'https://bitbucket.org/' + name + '/get/' + tag + '.zip';
  } else {
    logger.error('Unknown repository hosting!');
    return null;
  }
}
