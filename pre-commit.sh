#!/usr/bin/env bash
#
# A git pre-commit hook to make all javascript files pass jshint and are all formatted.
#
# To enable this hook, add a symbolic link to this file in your
# repository's .git/hooks directory with the name "pre-commit"
#

exec 1>&2

# only test code that is being committed
git stash -q --keep-index



# jshint
#TODO: actually jshint

# jsformatted
#TODO: actually test if formatted correctly



# pop stash
git stash pop -q


exit 0
