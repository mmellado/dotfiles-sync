const spawn = require('child_process').spawn;
const colors = require('colors');

const { GIT_PROXY, GIT } = require('../lib/constants.js');

/**
 * Handles the proxy of any git commands
 * @param {string} options - The command options to be executed through the proxy
 */
const git = options => {
  const gitCommand = [].concat(GIT_PROXY.split(' '), options);

  const cmd = spawn(GIT, gitCommand);
  console.log(`${'STDIN:'.green.bold} ${GIT} ${gitCommand.join(' ')}`);

  // Output the stdout
  cmd.stdout.on('data', data => {
    const msg = data.toString();
    if (msg.length) {
      console.log(msg);
    }
  });

  cmd.on('error', err => {
    console.log(err.toString());
  });

  cmd.stderr.on('data', data => {
    console.log(data.toString());
  });
};

module.exports = git;
