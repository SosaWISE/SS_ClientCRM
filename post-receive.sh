#!/bin/sh
DIR=/home/user/crmprod

# make output dir
mkdir -p ${DIR}
# checkout tree
# GIT_WORK_TREE=${DIR} git checkout -f master
git --git-dir=/home/user/crm.git --work-tree=${DIR} checkout -f master

# install and build
cd ${DIR}
npm install
grunt init
grunt build
