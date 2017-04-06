# Kadira RMA

This is the metrics pre-aggregation service for Kadira. We pre-aggregate the raw for three different time resolutions.
They are:

* 1min
* 30min
* 3hour

We need to run each of above aggregation for following collections in the db

* errorMetrics
* methodsMetrics
* pubMetrics
* systemMetrics

So, we need to run 12 aggregation jobs for one shard.

> In this repo, you could run all 12 of these jobs in a single command.
> But that's not recommended to do in production. You must use upstart, systemd or something similar.
> (These scripts manage wait-time so, you should not run these scripts with a cronjob)

## What does this do

A aggregation job fetches raw data from MongoDB and aggregate them locally. Basically, we run MongoDB map reduce job outside of MongoDB.
MongoDB is pretty good at serving data, but it's not good at job management.

We tried using Map Reduce and Aggregation Pipelines. They do work. But with the high data load and the increasing number of aggregation jobs, some of the jobs get stucked.

Even though, we fetch raw data this method if fast and reliable.

> Since we fetch a lot of data, it's recommended to place these aggregation jobs closer to the DB.

## Setup

npm install

## Running

Add correct configurations to `../init-shell.sh`. Then apply these commands:

```sh
. ../init-shell
sh run.sh
```
