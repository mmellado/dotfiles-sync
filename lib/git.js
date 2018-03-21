const { spawn } = require('child_process');
require('colors');

const { GIT_PROXY, GIT } = require('../lib/constants.js');

/**
 * Handles the proxy of any git commands
 * @param {string} options - The command options to be executed through the proxy
 */
const git = options => {
  const gitCommand = [].concat(GIT_PROXY.split(' '), options);

  const cmd = spawn(GIT, gitCommand, { stdio: 'inherit' });
  console.log(`> ${'Command:'.bold} ${GIT} ${gitCommand.join(' ')}`);

  /**
   * Listens for errors outputed from the command (invalid arguments and options, etc)
   */
  cmd.on('error', err => {
    console.log(`> ${'Error:'.bold.red} ${err.toString()}`);
  });
};

module.exports = git;
