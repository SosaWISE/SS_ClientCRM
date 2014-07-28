#!/usr/bin/env bash

# Run this setup.sh script to copy the git pre-commit hook into the appropriate
# place in your git file structure.
#
# After this script is run and the git hook is in place, the pre-commit script
# will be run automatically before each git commit.

set -e
set -u

# Determine where the rest repository root is.
SCRIPT_DIR="$(cd "$(dirname "$0")" && env pwd -P)"

# Alert the user and exit if the predetermined root directory does not
# exist.
if [ ! -d "$SCRIPT_DIR" ]; then
    echo "$SCRIPT_DIR does not exist" >&2
    exit 1
fi

# Determine where the .git directory is.
if [ -f $SCRIPT_DIR/.git ]; then
    # The git symbolic link in the .git ascii file is of the form:
    #
    # gitdir: <path>
    #
    # This sed command extracts <path>, which is the .git directory for rest.
    GIT_DIR=$(sed "s/^[^ ]* //" $SCRIPT_DIR/.git)
else
    GIT_DIR=$SCRIPT_DIR/.git
fi

# use a symbolic link so we don't have to run this script again
# if the pre-commit hook changes.
ln -snf $SCRIPT_DIR/pre-commit.sh $GIT_DIR/hooks/pre-commit

