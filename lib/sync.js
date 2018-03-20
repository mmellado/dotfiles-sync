'use strict';

const path = require('path');
const util = require('util');
const spawn = require('child_process').spawn;
const colors = require('colors');

const { HOME_DIR, GIT, GIT_PROXY } = require('../lib/constants.js');

const sync = repository => {
  const dotfilesRepo = path.resolve(HOME_DIR, '.dotfiles').trim();
  let checkoutError = false;
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
    const checkout = spawn(GIT, ['checkout']);

    checkout.stdout.on('data', data => {
      const msg = data.toString();
      if (msg.length) {
        console.log(msg);
      }
    });

    checkout.stderr.on('data', data => {
      console.log(data.toString());
    });

    checkout.on('error', data => {
      checkoutError = true;
    });

    checkout.on('exit', code => {
      console.log('done');
    });
  });
};

module.exports = sync;
