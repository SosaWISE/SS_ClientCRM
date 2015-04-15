#!/bin/bash
shopt -s extglob

# grunt init
grunt build --no-color

echo "rsync to ${DEST}"
# ensure dest exists
mkdir -p "${DEST}"
# copy/delete
rsync -av --delete --exclude /webconfig.js ./www/ "${DEST}"
echo "...done"
