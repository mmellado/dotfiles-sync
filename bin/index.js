#!/usr/bin/env node
'use strict';

const args = require('../lib/args.js');
const setup = require('../lib/setup.js');

const homeDir = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
const gitCommand = `/usr/bin/git --git-dir=${homeDir}/.dotfiles/ --work-tree=${homeDir}`;

switch (args.command) {
  case 'setup':
    setup(gitCommand, args.repository);
    break;
  case 'sync':
    break;
  case 'git':
  default:
    break;
}
