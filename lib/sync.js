'use strict';

const fs = require('fs-extra');
const path = require('path');
const { spawn, exec: dExec } = require('child_process');
const util = require('util');
require('util.promisify');
const exec = util.promisify(dExec);
const colors = require('colors');
var isGitURL = require('is-git-url');

const { GIT, HOME_DIR, GIT_PROXY } = require('../lib/constants.js');

/**
 * Builds the setup based on an existing git repository
 * @param {string} repository - The repository to build the setup from
 */
const sync = repository => {
  const backupDir = path.resolve(HOME_DIR, `.dotfiles-sync-backup-${new Date() / 1000}`);
  const dotfilesRepo = path.resolve(HOME_DIR, '.dotfiles').trim();
  const cloneCommand = `clone --bare ${repository} ${dotfilesRepo}`;

  if (!isGitURL(repository)) {
    return `> ${'ERROR:'.red.bold} The repository provided is not a valid GIT url`;
  }

  // Clone the bare repository into the $HOME/.dotfiles
  console.log(`> Cloning repository\n`);
  const clone = spawn(GIT, cloneCommand.split(' '), { stdio: 'inherit' });

  /**
   * Listens for errors and outputs them
   */
  clone.on('error', err => {
    console.log(`> ${'Error:'.bold.red} ${err.toString()}`);
  });

  /**
   * Listens for the clone command to exit.
   */
  clone.on('exit', code => {
    if (code) {
      // Ensure we don't proceed if we were unable to clone the repository
      process.exit(code);
    }
    console.log(
      `\n> Configuring repository to omit untracked filed on ${'dotfiles status'.magenta}`
    );
    // once we checked out, configure to not show untracked files
    exec(`${GIT} ${GIT_PROXY} config --local status.showUntrackedFiles no`)
      .then(() => exec(`${GIT} ${GIT_PROXY} status`))
      .then(status => {
        // Then we check if any of the files in the repo already exist
        const repoFiles = status
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('deleted'))
          .map(line => line.replace('deleted:', '').trim());

        const filesInTargetDir = fs.readdirSync(HOME_DIR);
        const conflictingFiles = repoFiles.filter(file => filesInTargetDir.includes(file));

        // If we have some repo files in the filesystem, back them up
        if (conflictingFiles.length) {
          console.log(`> Repository files were found in ${HOME_DIR.bold.blue}`);
          console.log(`> Backing them up...`);
          const backupDir = path.resolve(HOME_DIR, `.dotfiles-sync-backup-${Date.now()}`);
          fs.mkdirsSync(backupDir);
          const promises = [];
          conflictingFiles.forEach(file => {
            const originalFilePath = path.resolve(HOME_DIR, file);
            const backupFilePath = path.resolve(backupDir, file);
            promises.push(fs.move(originalFilePath, backupFilePath).catch(err => err));
          });
          return Promise.all(promises).then(() => {
            console.log(`> The following files were backed up to ${backupDir.bold.blue}`);
            conflictingFiles.forEach(file => console.log(`    ${file}`));
            console.log('');
          });
        } else {
          // otherwise, proceed
          return true;
        }
      })
      .then(() => {
        // Now we know there are no conflicts and if there were any, they were backed up
        console.log(`> Checking out the repository into ${HOME_DIR.bold.blue}`);
        const checkoutCommand = `${GIT_PROXY} checkout`;
        const checkout = spawn(GIT, checkoutCommand.split(' '), { stdio: 'inherit' });

        checkout.on('exit', code => {
          if (!code) {
            const dotfilesDir = path.resolve(HOME_DIR, '.dotfiles');
            console.log('\n *************************************************'.green.bold);
            console.log(' *                                               *'.green.bold);
            console.log(' *            Configuration successful!          *'.green.bold);
            console.log(' *                                               *'.green.bold);
            console.log(' *************************************************\n'.green.bold);
            console.log(`${'Repository configured:'.bold.blue} ${repository}`);
            console.log(`${'Bare repository location:'.bold.blue} ${dotfilesDir}`);
            console.log(
              `You can now use the ${'dotfiles'.magenta} command to interact with your repository`
            );
            console.log(`eg: ${'dotfiles add ~/.bashrc'.magenta}\n`);
          }
        });
      })
      .catch(err => console.log(`> ${'Error:'.bold.red} ${err.toString()}`));
  });
};

module.exports = sync;
