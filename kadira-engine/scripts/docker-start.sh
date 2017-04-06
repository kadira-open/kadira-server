#!/bin/bash

# The start-rma.sh script did not work (missing start.sh error).
# Maybe I overlooked something obvious here. Fix it later :P
# cd /app
# bash start-rma.sh &
# node server.js

cd /app/rma
export MONGO_SHARD=one
export MONGO_URL=$MONGO_URL
export MONGO_METRICS_URL=$MONGO_METRICS_URL
PROFILE=1min PROVIDER=system bash start.sh &
PROFILE=1min PROVIDER=methods bash start.sh &
PROFILE=1min PROVIDER=pubsub bash start.sh &
PROFILE=1min PROVIDER=errors bash start.sh &
PROFILE=30min PROVIDER=system bash start.sh &
PROFILE=30min PROVIDER=methods bash start.sh &
PROFILE=30min PROVIDER=pubsub bash start.sh &
PROFILE=30min PROVIDER=errors bash start.sh &
PROFILE=3hour PROVIDER=system bash start.sh &
PROFILE=3hour PROVIDER=methods bash start.sh &
PROFILE=3hour PROVIDER=pubsub bash start.sh &
PROFILE=3hour PROVIDER=errors bash start.sh &

cd /app
node server.js
