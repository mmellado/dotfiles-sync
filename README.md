# Dotfiles Sync

Dotfiles Sync is a CLI tool that lets you sync your dotfiles to a git repository.

This utility works as a proxy to implement the workflow described in [This blog post](https://developer.atlassian.com/blog/2016/02/best-way-to-store-dotfiles-git-bare-repo/), which was originally a suggestion on [Hacker News](https://news.ycombinator.com/item?id=11070797).

To quote the blog post and HN thread, using particular flow to backup your dotfiles has a lot of advantages:

> No extra tooling, no symlinks, files are tracked on a version control system, you can use different branches for different computers, you can replicate you configuration easily on new installation.

This package does nothing more than follow the setup described above, acting as a Git proxy that allows you to get started with zero configuration.

## Installation

```bash
$ npm install -g dotfiles-sync
```

or

```bash
$ yarn global add dotfiles-sync
```

## Usage

### First time

If you have never used the flow described above, you'll have to start by creating the bare repository for your dotfiles.

```bash
$ dotfiles setup
```

If you wish to push this repository to a remote location in GitHub or Bitbucket, you can pass the repository and it will be automatically linked for you.

```bash
$ dotfiles setup --repository=git@github.com:[your-user]/dotfiles.git
```

Running the `setup` command will take care of the following:

* Create a bare repository in your `$HOME/.dotfiles` directory
* Add a `.gitignore` file at `$HOME` with `.dotfiles` as it content
* Add the `.gitignore` file to the repository
* Configure the repository to not show any untracked files

Once the repository is created, dotfiles can be used as a proxy for the git commands addressing your dotfiles

```bash
dotfiles commit -am "Add gitignore" && dotfiles push origin master
```

### Restoring an existing repository

If you've already built a backup and stored it in a remote git repository, this tool can help you bring it into a new machine.

```bash
dotfiles sync git@github.com:[your-user]/dotfiles.git
```

This will take care of the following actions

* Checkout the provided repository as a bare repository in `$HOME/.dotfiles`
* Configure it to not show untracked files
* Checkout the contents of your repository to your `$HOME` directory
* If any of the files in the repository already exist in your file system, it will back them up

At this point, you can continue adding new stuff into your dotfiles repository by using the `dotfiles` command

```bash
dotfiles add .vimrc
```

## Other implementations

Nicola posted a shell version of this in his blog post. This is simply a rewrite using Node.

## Known issues

Git interactive commands don't work too well. This is because javascript is executing them so the interactivity becomes unresponsive. This version is my initial prototype so I will continue looking into how to fix this.

## Special Thanks

To [Nicola Paolucci](https://github.com/durdn) for an amazingly well written blog post and to [StreakyCobra](https://news.ycombinator.com/user?id=StreakyCobra) for the original idea
