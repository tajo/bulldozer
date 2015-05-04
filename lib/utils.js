import {exec} from 'child_process';
import {createHash} from 'crypto';

export default new class Utils {

  run(command) {
    console.log(`Running: ${command}`);
    const child = exec(command, function(error, stdout, stderr) {
      console.log('stdout: ', stdout);
      console.log('stderr: ', stderr);
      if (error !== null) {
        console.log('exec error: ', error);
      }
      return {stdout, stderr, error};
    });

    child.stdout.on('data', function(data) {
      console.log(data);
    });
    child.stderr.on('data', function(data) {
      console.log('ERROR: ' + data);
    });
    child.on('close', function(code) {
      console.log(`Finished: ${command}`);
    });
  }

};

export function md5(input) {
  return createHash('md5').update(input).digest('hex');
}
