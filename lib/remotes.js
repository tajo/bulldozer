export default function getRemote(remote, name, tag) {
  if (!remote) {
    console.log('You must specify repository hosting!');
    return null;
  }

  if (!name) {
    console.log('You must specify repository name!');
    return null;
  }

  const lowerRemote = remote.toLowerCase();
  if (lowerRemote === 'github') {
    return 'https://github.com/' + name + '/archive/' + tag + '.zip';
  } else if (lowerRemote === 'bitbucket') {
    return 'https://bitbucket.org/' + name + '/get/' + tag + '.zip';
  } else {
    console.log('Unknown repository hosting!');
    return null;
  }
}
