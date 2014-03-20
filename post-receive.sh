#!/bin/sh
DIR=/home/dev/src/staging/crm

# make output dir
mkdir -p ${DIR}
# checkout tree
GIT_WORK_TREE=${DIR} git checkout -f master
# install and build
cd ${DIR}
npm install
grunt build
