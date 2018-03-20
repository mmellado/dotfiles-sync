const spawn = require('child_process').spawn;
const colors = require('colors');

const { GIT_PROXY } = require('../lib/constants.js');

const git = options => {
  const gitCommand = `${GIT_PROXY} ${options}`;

  const cmd = spawn('/usr/bin/git', gitCommand.split(' '));

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
