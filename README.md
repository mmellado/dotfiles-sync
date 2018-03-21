# Dotfiles Sync

Dotfiles Sync is a CLI tool that lets you sync your dotfiles to a git repository.

This utility works as a proxy to implement the workflow described in [this blog post](https://developer.atlassian.com/blog/2016/02/best-way-to-store-dotfiles-git-bare-repo/), which was originaly the outcome of this [Hacker News thread](https://news.ycombinator.com/item?id=11070797).

To quote the blog post and HN thread, using this particular flow to backup your dotfiles has a lot of advantages:

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

If you wish to push this repository to a remote location in GitHub or Bitbucket, you can pass the repository as an option and it will be automatically linked for you.

```bash
$ dotfiles setup --repository=git@github.com:[your-user]/dotfiles.git
```

Running the `setup` command will take care of the following:

* Create a bare repository in your `$HOME/.dotfiles` directory
* Add a `.gitignore` file at `$HOME` with `.dotfiles` as its content
* Add the `.gitignore` file to the repository
* Configure the repository to not show any untracked files

Once the repository is created, `dotfiles` can be used as a proxy for the git commands working over tit

```bash
$ dotfiles commit -am "Add gitignore" && dotfiles push origin master
```

### Restoring an existing repository

If you've already built a backup and stored it in a remote git repository, this tool can help you bring it into a new machine.

```bash
$ dotfiles sync git@github.com:[your-user]/dotfiles.git
```

This will take care of the following actions

* Checkout the provided repository as a bare repository in `$HOME/.dotfiles`
* Configure it to not show untracked files
* Backup any files in `$HOME` that are also part of the remote repository
* Checkout the contents of your repository to your `$HOME` directory

At this point, you can continue adding new stuff into your dotfiles repository by using the `dotfiles` command.

```bash
$ dotfiles add .bashrc
```

## Other implementations

Nicola Paolucci posted a shell version of this in his blog post. This is simply a rewrite using Node for distribution purposes.

## Important Note about SSH Keys

These are a bit hard to deal with as if they it they are needed to pull a repository. When you run `dotfiles sync`, a git repository is needed. To be able to clone the repository, you will need to have valid SSH keys (`~/.ssh`). However, if the repository contains the `.ssh` directory in it, `dotfiles` will attempt to back it up before checking out the repository content, and then fail at checking out because no SSH keys are present. There are ways to work around this, however, I still do not advise to backup your SSH keys with `dotfiles` as these are generally considered sensitive information.

## Special Thanks

To [Nicola Paolucci](https://github.com/durdn) for an amazingly well written blog post and to [StreakyCobra](https://news.ycombinator.com/user?id=StreakyCobra) for the original idea
