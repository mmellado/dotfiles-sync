require('util.promisify').shim();
require('colors');

const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const isGitURL = require('is-git-url');

const { HOME_DIR, GIT, GIT_PROXY } = require('../lib/constants.js');

/**
 * Handles the initial setup of the bare repository. It can link it to a remote repository
 * if the option is passed
 * @param {string} repository - Remote repository to link the local bare repository to
 */
const setup = (repository = null) => {
  const dotfilesDir = path.resolve(HOME_DIR, '.dotfiles');
  const dotfilesGitIgnore = path.resolve(HOME_DIR, '.gitignore');

  // Start by creating the local repository
  exec(`git init --bare ${dotfilesDir}`)
    .then(() => exec(`${GIT} ${GIT_PROXY} config --local status.showUntrackedFiles no`))
    .then(() => {
      // Once it's done, if a remote repository was passed, link it
      if (repository) {
        if (!isGitURL(repository)) {
          console.log(
            `> ${
              'WARNING:'.yellow.bold
            } The repository provided is not a valid GIT url. Ignoring the remote linking`
          );
        }
        return exec(`${GIT} ${GIT_PROXY} remote add origin ${repository}`);
      }
      return true;
    })
    .then(() =>
      // Build the initial .gitignore in $HOME and add it to the repository
      exec(
        `echo ".dotfiles" >> ${dotfilesGitIgnore} && ${GIT} ${GIT_PROXY} add ${dotfilesGitIgnore}`
      )
    )
    .then(() => {
      // Output success message
      console.log('\n *************************************************'.green.bold);
      console.log(' *                                               *'.green.bold);
      console.log(' *                Setup successful!              *'.green.bold);
      console.log(' *                                               *'.green.bold);
      console.log(' *************************************************/\n'.green.bold);
      console.log(`${'Bare repository location:'.bold.blue} ${dotfilesDir}`);
      if (repository) {
        console.log(`${'Remote repository:'.blue.bold} ${repository}`);
      }
      console.log(
        `You can now use the ${'dotfiles'.magenta} command to interact with your repository`
      );
      console.log(`eg: ${'dotfiles add ~/.bashrc'.magenta}\n`);
    })
    .catch(err => console.log(`> ${'Error:'.bold.red} ${err.toString()}`));
};

module.exports = setup;
