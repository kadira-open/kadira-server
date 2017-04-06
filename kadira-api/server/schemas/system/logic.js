import UpTimeMonitor from './uptime_monitor';
import _ from 'lodash';

export default class Logic {
  constructor(config) {
    this.mongoCluster = config.mongoCluster;
    this.shards = [];
    _.forEach(this.mongoCluster._shardMap, shard => {
      this.shards.push({
        name: shard.name
      });
    });

    this.upTimeMonitor = new UpTimeMonitor(config);
  }

  getStatuses(shard, collection, res, start, end) {
    let t = normalizeToMin(start);
    const minute = 1000 * 60;
    let resultPromises = [];

    while (t < end) {
      const promise = this.upTimeMonitor.getStatus(shard, collection, res, t);
      resultPromises.push(promise);
      t += minute;
    }

    return Promise.all(resultPromises);
  }

  getShardList() {
    return this.shards;
  }
}

function normalizeToMin(time) {
  var diff = time % (1000 * 60);
  return time - diff;
}
