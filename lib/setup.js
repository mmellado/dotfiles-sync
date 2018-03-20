'use strict';

const path = require('path');
const util = require('util');
require('util.promisify').shim();
const exec = util.promisify(require('child_process').exec);
const colors = require('colors');

const { HOME_DIR, GIT, GIT_PROXY } = require('../lib/constants.js');

/**
 * Handles the initial setup of the bare repository. It can link it to a remote repository
 * if the option is passed
 * @param {string} repository - Remote repository to link the local bare repository to
 */
const setup = (repository = null) => {
  const dotfilesRepo = path.resolve(HOME_DIR, '.dotfiles');
  const dotfilesGitIgnore = path.resolve(HOME_DIR, '.gitignore');

  // Start by creating the local repository
  exec(`git init --bare ${dotfilesRepo}`)
    .then(() => exec(`${GIT} ${GIT_PROXY} config --local status.showUntrackedFiles no`))
    .then(() => {
      // Once it's done, if a remote repository was passed, link it
      if (repository) {
        return exec(`${GIT} ${GIT_PROXY} remote add origin ${repository}`);
      } else {
        return true;
      }
    })
    .then(() =>
      // Build the initial .gitignore in $HOME and add it to the repository
      exec(
        `echo ".dotfiles" >> ${dotfilesGitIgnore} && ${GIT} ${GIT_PROXY} add ${dotfilesGitIgnore}`
      )
    )
    .then(() => {
      // Output success message
      console.log('\n/*************************************************'.green.bold);
      console.log(' *          Dotfiles repository created!         *'.green.bold);
      console.log(' *************************************************/\n'.green.bold);
      console.log(`Your .dotfiles bare repository was created at ${dotfilesRepo.bold.blue}`);
      if (repository) {
        console.log(`Your local repository is pointing to this remote: ${repository.bold.blue}`);
      }
      console.log(
        `A git ignore with the repository folder was created at ${dotfilesGitIgnore.bold.blue}`
      );
      console.log(
        `You can start adding files to the repository by using the ${
          'dotfiles'.bold.green
        } command as a proxy for git\n`
      );
    })
    .catch(err => console.log(err.stack.bold.red));
};

module.exports = setup;
