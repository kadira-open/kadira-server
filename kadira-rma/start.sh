#!/bin/bash

## USAGE: PROFILE=1min WAIT_TIME=60 start.sh

if [[ -z $WAIT_TIME ]]; then
  WAIT_TIME=60
fi

if [[ -z $PROFILE ]]; then
  PROFILE=1min
fi

if [[ -z $PROVIDER ]]; then
  PROVIDER=methods
fi

if [[ -z $MONGO_URL ]]; then
  MONGO_URL="mongodb://localhost/apm"
fi

if [[ -z $MONGO_METRICS_URL ]]; then
  MONGO_METRICS_URL=$MONGO_URL
fi

if [[ -z $MONGO_SHARD ]]; then
  echo "MONGO_SHARD env var is required!"
  exit 1
fi

ENV_FILE_NAME="env-$PROFILE-$PROVIDER.js"

dumpEnvVarsTo() {
  # getting primary from the appUrl
  MONGO_APP_CONN=$(pick-mongo-primary $MONGO_URL)
  # using this ugly ~~~ to replace spaces which cause some
  # issues with our env vars exposing script
  export MONGO_APP_CONN=${MONGO_APP_CONN// /"~~~"}

  # HACK: exposting env vars to the mongo shell
  ENV_DATA=$(env)
  echo "var ENV_DATA='"$ENV_DATA"';" > $1
  cat _envDataProcess.js >> $1
}

while [[ true ]]; do
  startedAt=$(date +%s)
  echo "--------------------------------------------------------"
  echo "`date`: start map-reduce process"

  dumpEnvVarsTo $ENV_FILE_NAME
  set -x;
  if [ -z ${START_TIME+x} ] || [ -z ${END_TIME+x} ]; then
      mongo $(pick-mongo-primary $MONGO_METRICS_URL) profiles/$PROFILE.js providers/$PROVIDER.js $ENV_FILE_NAME lib.js mapreduce.js incremental-aggregation.js;
  else
      mongo $(pick-mongo-primary $MONGO_METRICS_URL) profiles/$PROFILE.js providers/$PROVIDER.js $ENV_FILE_NAME lib.js mapreduce.js batch-aggregation.js;
  fi
  set +x;
  completedAt=$(date +%s)
  diff=$(($completedAt-$startedAt))
  newWaitTime=$(($WAIT_TIME-$diff))

  echo "`date`: end map-reduce process (tooks $diff secs)"

  if [[ $ONLY_ONCE ]]; then
    break
  fi

  sleep $newWaitTime
done
