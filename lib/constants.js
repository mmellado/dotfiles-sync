const HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
const GIT = 'git';
const GIT_PROXY = `--git-dir=${HOME_DIR}/.dotfiles/ --work-tree=${HOME_DIR}`;

module.exports = { HOME_DIR, GIT, GIT_PROXY };
