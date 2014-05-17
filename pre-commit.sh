#!/usr/bin/env bash
#
# A git pre-commit hook to make all javascript files pass jshint and are all formatted.
#
# To enable this hook, add a symbolic link to this file in your
# repository's .git/hooks directory with the name "pre-commit"
#

exec 1>&2


# The below check is to make sure file names don't include unusual characters.
# It was modified from the example pre-commit hook found in any recently created repo.
NEW_NAMES=$(git diff --cached --name-only --diff-filter=ACR -z)
if echo "${NEW_NAMES}" | grep -q [^a-zA-Z0-9\.\_\\\/\-]; then
  echo "Error: Attempt to add an invalid file name"
  echo "${NEW_NAMES}" | grep [^a-zA-Z0-9\.\_\\\/\-]
  echo
  echo "File names can only include letters, numbers,"
  echo "hyphens, underscores and periods"
  echo
  echo "Please rename your file before committing it"
  exit 1
fi


# In some cases this can erase code. Plus all code should pass jshint and jsbeautifier tests.
# # only test code that is being committed
# git stash save --include-untracked --keep-index --quiet "pre-commit"
# function cleanup {
#   # pop stash
#   git stash pop --quiet --index
# }
# # cleanup on exit
# trap cleanup EXIT


# javascript formatting - faster than jshint
RESULT=`grunt --no-color jsbeautifier:test`
if echo "${RESULT}" | grep -q "Aborted"; then
  echo "Javascript formatting test failed"
  echo "One or more javascript files is not correctly formatted"
  echo
  echo "${RESULT}"
  exit 1
fi

# jshint
RESULT=`grunt --no-color jshint`
if echo "${RESULT}" | grep -q "Aborted"; then
  echo "JsHint failed"
  echo
  echo "${RESULT}"
  exit 1
fi


exit 0
