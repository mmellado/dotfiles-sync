'use strict';

const fs = require('fs-extra');
const path = require('path');
const spawn = require('child_process').spawn;
const respawn = require('respawn');
const colors = require('colors');

const { HOME_DIR, GIT, GIT_PROXY } = require('../lib/constants.js');

const sync = repository => {
  const dotfilesRepo = path.resolve(HOME_DIR, '.dotfiles').trim();
  const cloneCommand = `clone --bare ${repository} ${dotfilesRepo}`;

  const clone = spawn(GIT, cloneCommand.split(' '));
  console.log(`${'STDIN:'.green.bold} ${GIT} ${cloneCommand}`);

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
    console.log(`Checking out the repositor contents in ${HOME_DIR.bold}`);
    const checkoutCommand = `${GIT} ${GIT_PROXY} checkout`;
    const checkout = respawn(checkoutCommand.split(' '));

    checkout.start();

    checkout.on('stdout', data => {
      const msg = data.toString();
      if (msg.length) {
        console.log(msg);
      }
    });

    checkout.on('stderr', data => {
      const backupDir = buildBackupDir();
      const error = data.toString();
      const filesToBackup = error
        .substring(error.indexOf(':') + 1, error.indexOf('Please'))
        .split('\n')
        .slice(1, -1)
        .map(file => file.trim());

      console.log('\nThe following files already exist in your filesystem\n');
      filesToBackup.forEach(file => {
        console.log(`  - ${path.resolve(HOME_DIR, file)}`);
        const originalPath = path.resolve(HOME_DIR, file);
        const newPath = path.resolve(HOME_DIR, backupDir, file);
        fs.moveSync(originalPath, newPath);
      });
      console.log(`\nBacked them up at ${backupDir.blue}\n`);
      checkout.stop();
      checkout.start();
    });

    checkout.on('crash', data => {
      console.log(error.toString());
    });

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

const buildBackupDir = () => {
  const backupDir = path.resolve(HOME_DIR, `.dotfiles-sync-backup-${new Date() / 1000}`);
  fs.mkdirSync(backupDir);
  return backupDir;
};

module.exports = sync;
