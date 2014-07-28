#!/bin/sh
# remote: fatal: Could not jump back into original cwd: No such file or directory
# crmprod works, but crm doesn't since it is crm.git without .git - http://stackoverflow.com/a/8513916
DIR=/home/user/crmprod

# make output dir
mkdir -p ${DIR}
# checkout tree
# GIT_WORK_TREE=${DIR} git checkout -f master
git --git-dir=/home/user/crm.git --work-tree=${DIR} checkout -f master

# install and build
cd ${DIR}
grunt init
grunt build
