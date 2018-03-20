'use strict';

const fs = require('fs-extra');
const path = require('path');
const { spawn, exec } = require('child_process');
const respawn = require('respawn');
const colors = require('colors');
var isGitURL = require('is-git-url');

const { HOME_DIR, GIT, GIT_PROXY } = require('../lib/constants.js');

/**
 * Builds the setup based on an existing git repository
 * @param {string} repository - The repository to build the setup from
 */
const sync = repository => {
  const backupDir = path.resolve(HOME_DIR, `.dotfiles-sync-backup-${new Date() / 1000}`);
  const dotfilesRepo = path.resolve(HOME_DIR, '.dotfiles').trim();
  const cloneCommand = `clone --bare ${repository} ${dotfilesRepo}`;

  if (!isGitURL(repository)) {
    return `${'ERROR:'.red.bold} The repository provided is not a valid GIT url`;
  }

  // Clone the bare repository into the $HOME/.dotfiles
  const clone = spawn(GIT, cloneCommand.split(' '));
  console.log(`${'STDIN:'.green.bold} ${GIT} ${cloneCommand}`);
  exec(`${GIT} ${GIT_PROXY} config --local status.showUntrackedFiles no`, err => {
    if (err) {
      console.log(err);
    }

    console.log('Preventing untracked files from showing');
  });

  clone.stdout.on('data', data => {
    const msg = data.toString();
    if (msg.length) {
      console.log(msg);
    }
  });

  clone.on('error', err => {
    console.log(err.toString());
  });

  clone.stderr.on('data', data => {
    console.log(data.toString());
  });

  clone.on('exit', code => {
    // When the clone finishes, checkout the contents of the repository into $HOME
    console.log(`Checking out the repository contents in ${HOME_DIR.bold}`);
    const checkoutCommand = `${GIT} ${GIT_PROXY} checkout`;
    const checkout = respawn(checkoutCommand.split(' '));
    let hasBackedUp = false;

    checkout.start();

    checkout.on('stdout', data => {
      const msg = data.toString();
      if (msg.length) {
        console.log(msg);
      }
    });

    /**
     * The checkout may fail if some of the files in the repository already exist in the filesystem.
     * When this is the case, we backup the files and retrigger the checkout command
     */
    checkout.on('stderr', data => {
      // if (!fs.existsSync(backupDir)) {
      //   fs.mkdirSync(backupDir);
      // }
      const error = data.toString();
      console.log(error);
      console.log('Please delete of backup the files and run the command again'.bold.yellow);
      // Remove the doftiles repository so it can be attempted again
      fs.removeSync(path.resolve(HOME_DIR, '.dotfiles'));
      process.exit(0);
      // const existingFiles = error.split('\n').filter(text => text.trim().startsWith('.'));

      // const filesToBackup = [];

      // existingFiles.forEach(file => {
      //   const fileName = file.includes('/') ? file.split('/')[0].trim() : file.trim();
      //   if (!filesToBackup.includes(fileName)) {
      //     filesToBackup.push(fileName);
      //   }
      // });

      // console.log(data.toString());
      // if (!filesToBackup.length) {
      //   console.log(data.toString());
      //   process.exit(0);
      // }
      // const promises = [];
      // console.log('\nThe following files already existed in your filesystem\n');
      // filesToBackup.forEach(file => {
      //   console.log(`  - ${path.resolve(HOME_DIR, file)}`);
      //   const originalPath = path.resolve(HOME_DIR, file);
      //   const newPath = path.resolve(HOME_DIR, backupDir, file);
      //   if (fs.existsSync(newPath)) {
      //     // If we fall here, it's already been backed up and we attempted to checkout again
      //     promises.push(remove(originalPath));
      //   } else {
      //     promises.push(fs.move(originalPath, newPath));
      //   }
      // });

      // Promise.all(promises)
      //   .then(() => {
      //     console.log(`\nBacked them up at ${backupDir.blue}\n`);
      //     checkout.stop();
      //     checkout.start();
      //   })
      //   .catch(err => {
      //     console.log(err);
      //     process.exit(0);
      //   });
    });

    checkout.on('crash', data => {
      console.log(error.toString());
    });

    /**
     * When the process ends, if there were no errors, we end the process sucessfuly
     */
    checkout.on('exit', code => {
      if (!code) {
        checkout.stop();
        const dotfilesDir = path.resolve(HOME_DIR, '.dotfiles');
        console.log(
          `The dotfiles repository at ${repository.blue} is now configured in your file system at ${
            dotfilesDir.green
          }`
        );
        process.exit(0);
      }
    });
  });
};

module.exports = sync;
