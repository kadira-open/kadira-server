var STAT_BUILD_INTERVAL = process.env.STAT_BUILD_INTERVAL || 1000 * 5;
STAT_BUILD_INTERVAL = parseInt(STAT_BUILD_INTERVAL);
var LIBRATO_EMAIL = process.env.LIBRATO_EMAIL;
var LIBRATO_TOKEN = process.env.LIBRATO_TOKEN;

var LastTime = {};
var Librato = Meteor.npmRequire('librato-node');
if(LIBRATO_EMAIL) {
  Librato.configure({email: LIBRATO_EMAIL, token: LIBRATO_TOKEN});
}

Shards.ready(function() {
  Shards.forEach(function(shard) {
    scheduleMetricsBuilding(shard, STAT_BUILD_INTERVAL);
  });
});

function scheduleMetricsBuilding(shard, interval) {
  var now = Date.now();
  buildMetrics(shard);
  var diff = Date.now() - now;

  var nextInterval = interval - diff;
  nextInterval = nextInterval < 0? 0 : nextInterval;
  Meteor.setTimeout(scheduleMetricsBuilding.bind(null, shard, interval), nextInterval);
}

function buildMetrics(shard) {
  var info = {
    at: Date.now()
  };

  // get insert count
  var serverStatus = shard.conn.command({serverStatus: 1});
  info.insertCount = serverStatus.metrics.document.inserted;
  var lastTimeInfo = LastTime[shard.name];
  if(lastTimeInfo) {
    var diffSecs = Math.ceil((info.at - lastTimeInfo.at) / 1000);
    var adddedDocs = info.insertCount - lastTimeInfo.insertCount;
    info.insertRate = (adddedDocs) / diffSecs;
  }

  // get dbSize
  var dbStat = shard.conn.command({dbstats: 1, scale: 1});
  info.dbSize = dbStat.dataSize + dbStat.indexSize;

  info.methodsDelay1min = getAggregationDelay(shard.conn, "methodsMetrics", "1min");
  info.methodsDelay30min = getAggregationDelay(shard.conn, "methodsMetrics", "30min");
  info.methodsDelay3hour = getAggregationDelay(shard.conn, "methodsMetrics", "3hour");

  info.pubsubDelay1min = getAggregationDelay(shard.conn, "pubMetrics", "1min");
  info.pubsubDelay30min = getAggregationDelay(shard.conn, "pubMetrics", "30min");
  info.pubsubDelay3hour = getAggregationDelay(shard.conn, "pubMetrics", "3hour");

  info.systemDelay1min = getAggregationDelay(shard.conn, "systemMetrics", "1min");
  info.systemDelay30min = getAggregationDelay(shard.conn, "systemMetrics", "30min");
  info.systemDelay3hour = getAggregationDelay(shard.conn, "systemMetrics", "3hour");

  info.errorDelay1min = getAggregationDelay(shard.conn, "errorMetrics", "1min");
  info.errorDelay30min = getAggregationDelay(shard.conn, "errorMetrics", "30min");
  info.errorDelay3hour = getAggregationDelay(shard.conn, "errorMetrics", "3hour");

  // get aggregation delays

  LastTime[shard.name] = info;
  sendToLibrato(shard.name, info);
}

function getAggregationDelay(conn, collection, res) {
  var now = Date.now();
  var options = {
    limit: 1,
    sort: {
      "$natural": -1
    }
  };

  var docs = conn.find(collection, {"value.res": res}, options);
  if(!docs[0]) {
    return 0;
  }

  var diffMillis = now - docs[0].value.startTime.getTime();
  var diffSecs = Math.ceil(diffMillis / 1000);
  return diffSecs;
}

function sendToLibrato (shardName, info) {
  if(!LIBRATO_EMAIL) {
    return;
  }

  info = _.omit(info, 'at');
  var options = {
    source: shardName
  };

  _.each(info, function(value, key) {
    value = (value >= 0)? value : 0;
    Librato.measure('mongocluster-' + key.toLowerCase(), value, options);
  });
  Meteor.wrapAsync(Librato.flush)();
}
