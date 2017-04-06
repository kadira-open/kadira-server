## Mongo Cluster Monitor

This is a daemon to monitor the health of our [Sharded Mongo Cluster](https://github.com/kadirahq/docs/blob/master/version-0/mongodb-sharding-at-kadira.md).

It simply track a few metrics and push them to Librato. Here are the types of metrics we are looking at:

* Insert Rate (Number of documents inserted per sec.)
* DB Size (Size of the DB)
* Aggregations delays for 1min, 30min and 3hour for following collections
    - methodsMetrics
    - pubMetrics
    - errorMetrics
    - systemMetrics

We are tracking above metrics for every one minutes(it's configurable) and push to librato.

## Setup

npm install

## Running

Add correct configurations to `../init-shell.sh`. Then apply these commands:

```sh
. ../init-shell
sh run.sh
```
