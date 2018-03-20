'use strict';

const path = require('path');
const util = require('util');
require('util.promisify').shim();
const exec = util.promisify(require('child_process').exec);
const colors = require('colors');

const setup = (gitCommand, repository) => {
  const dotfilesRepo = path.resolve(homeDir, '.dotfiles');
  const dotfilesGitIgnore = path.resolve(homeDir, '.gitignore');
  exec(`git init --bare ${dotfilesRepo}/`)
    .then(() => exec(`${gitCommand} config --local status.showUntrackedFiles no`))
    .then(() => {
      if (repository) {
        return exec(`${gitCommand} remote add origin ${repository}`);
      } else {
        return true;
      }
    })
    .then(() =>
      exec(`echo ".dotfiles" >> ${dotfilesGitIgnore} && ${gitCommand} add ${dotfilesGitIgnore}`)
    )
    .catch(err => console.log(err.stack.bold.red));
};

module.exports = setup;
