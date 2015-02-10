#!/bin/bash
shopt -s extglob

# grunt init
grunt build

echo "rsync to ${DEST}"
rsync -av --delete --exclude /webconfig.js ./www/ "${DEST}"
echo "...done"
