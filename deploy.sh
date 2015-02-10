#!/bin/bash
shopt -s extglob

grunt init
grunt build

echo "Copy to ${DEST}"
# remove all but webconfig from destination
rm -rf "${DEST}/!(webconfig.js)"
# copy all but webconfig to destination
mkdir -p "${DEST}"
cp -r www/!(webconfig.js) "${DEST}"
echo "...done"
