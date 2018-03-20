'use strict';

const ArgumentParser = require('argparse').ArgumentParser;
const pkg = require('../package.json');
const colors = require('colors');

const defaultCommands = ['setup', 'sync', '-v', '--version', '-h', '--help'];

const mainCommand = process.argv[2];
let args = {};

/**
 * Only initialize the ArgumentParser if a subcomand, version or help are requested.
 * Otherwise, build the arguments to be passed to the git proxy
 */
if (!defaultCommands.includes(mainCommand)) {
  const commands = process.argv.slice();
  // Remove the process and file from the arguments then build a string from them to be used as
  // the git options
  commands.splice(0, 2);
  const options = commands.join(' ');
  args.command = 'git';
  args.options = options;
} else {
  // Build ArgParser for help outputs etc
  const parser = new ArgumentParser({
    version: pkg.version,
    addHelp: true,
    description: pkg.description,
    epilog: 'Any command not documented in this help file will be executed as a git command for the local dotfiles repository'
      .bold.yellow,
  });

  const subparser = parser.addSubparsers({ title: 'commands', dest: 'command' });

  const setup = subparser.addParser('setup', {
    addHelp: true,
    description: `Setup the initial local bare repository. This is what you want if you've never created a dotfiles repository before`,
  });
  setup.addArgument('--repository', {
    action: 'store',
    help: 'Remote git repository to link the new repo to',
  });

  const sync = subparser.addParser('sync', {
    addHelp: true,
    description: `Setup the initial local bare repository based on an existing one. This is what you want if you've created a dotfiles repository before and pushed it to a remote repository`,
  });
  sync.addArgument(['repository'], {
    action: 'store',
    help: 'Remote git repository containing the desired dotfiles',
  });

  args = parser.parseArgs();
}

module.exports = args;
