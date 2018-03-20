'use strict';

const path = require('path');
const util = require('util');
require('util.promisify').shim();
const exec = util.promisify(require('child_process').exec);
const colors = require('colors');

const sync = repository => {};

module.exports = sync;
