#!/usr/bin/env node
'use strict';

const args = require('../lib/args.js');
const setup = require('../lib/setup.js');
const sync = require('../lib/sync.js');
const git = require('../lib/git.js');

/**
 * Execute the right function based on the provided arguments
 */
switch (args.command) {
  case 'setup':
    setup(args.repository);
    break;
  case 'sync':
    sync(args.repository);
    break;
  case 'git':
  default:
    git(args.options);
    break;
}
