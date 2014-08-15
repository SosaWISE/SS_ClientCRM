#!/bin/sh
DEPLOY_ENV=dev # replace with correct environment
DIR=/home/dev/src/$DEPLOY_ENV/crm
# ensure the directory exists
mkdir -p "$DIR"

# read STDIN (Format: "from_commit to_commit branch_name")
BRANCH=""
while read from_commit to_commit branch_name
do
    BRANCH=$(git rev-parse --symbolic --abbrev-ref $branch_name)
done
echo "Received branch '$BRANCH'"
# checkout branch that was pushed
GIT_WORK_TREE="$DIR" git checkout -f $BRANCH
# build site
cd "$DIR"
grunt init
grunt build

# # test using
# git log -2 --format=oneline --reverse
# #output
# # FROM_ID
# # TO_ID
# echo "$FROM_ID $TO_ID master" | ./hooks/post-receive
