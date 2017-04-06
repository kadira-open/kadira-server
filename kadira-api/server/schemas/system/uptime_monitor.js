import Promise from 'bluebird';
var LRU = require('lru-cache');
const logger = console;

export default class UpTimeMonitor {
  constructor({mongoCluster, waitPeriod}) {
    const options = { max: 500, maxAge: 1000 * 60 * 10 };
    this._cache = LRU(options);
    this._mongoCluster = mongoCluster;

    // When UpTimeMonitor does not find aggregated metrics in a given timestamp
    // if its older than this._waitPeriod of time (in milliseconds) it assumes
    // RMA did not run in that timestamp and caches it as so.
    // If a timestamp is not older than this._waitPeriod and not aggregated
    // metrics found for its undecided whether RMA ran. Indicated by 'null'.
    this._waitPeriod = waitPeriod || 1000 * 60 * 5;
  }

  async getStatus(shard, collectionName, res, timestamp) {
    const cacheKey = this.getCacheKey(shard, collectionName, res, timestamp);
    const cached = this._cache.get(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    const conn = this._mongoCluster.getConnection(shard);
    const coll = conn.collection(collectionName);
    const selector = {
      'value.startTime': new Date(timestamp),
      'value.res': '1min'
    };

    const cursor = coll.find(selector, {'value.startTime': 1}).limit(1);
    let count = 0;
    try {
      count = await Promise.promisify(cursor.count.bind(cursor))();
    } catch (e) {
      logger.log(e);
      return null;
    }

    if (count) {
      this._cache.set(cacheKey, true);
      return true;
    }

    // RMA has not run for that
    const now = Date.now();
    if (now - timestamp > this._waitPeriod) {
      this._cache.set(cacheKey, false);
      return false;
    }

    // RMA has not run but the wait period is not over.
    return null;
  }

  getCacheKey(shard, collection, res, timestamp) {
    return shard + collection + res + timestamp;
  }
}
