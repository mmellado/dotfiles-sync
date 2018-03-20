const spawn = require('child_process').spawn;
const colors = require('colors');

const { GIT_PROXY, GIT } = require('../lib/constants.js');

/**
 * Handles the proxy of any git commands
 * @param {string} options - The command options to be executed through the proxy
 */
const git = options => {
  const gitCommand = `${GIT_PROXY} ${options}`;

  const cmd = spawn(GIT, gitCommand.split(' '));
  console.log(`${'STDIN:'.green.bold} ${GIT} ${gitCommand}`);

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
