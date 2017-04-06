var _ = require('underscore');
var uuid = require('uuid');
var expire = require('./_expire');

var SYSTEM_METRICS_FIELDS = [
  'startTime', 'endTime', 'sessions', 'memory', 'loadAverage',
  'totalTime', 'pctEvloopBlock',
  "pcpu", "cputime", "pcpuUser", "pcpuSystem",
  "newSessions", 'gcScavengeCount', 'gcScavengeDuration',
  'gcFullCount', 'gcFullDuration',
];

module.exports = function (data) {
  var appId = data.appId;
  var ttl = expire.getTTL(data.app);

  // keeping systemMetrics longer for host counting
  if (ttl < 1000 * 60 * 60 * 24 * 45) {
    ttl = 1000 * 60 * 60 * 24 * 45;
  }

  if (!(appId && data.systemMetrics)) return null;
  return data.systemMetrics.map(function (_metrics) {
    var metrics = _.pick(_metrics, SYSTEM_METRICS_FIELDS);
    metrics.appId = appId;
    metrics.host = data.host;
    metrics.startTime = new Date(metrics.startTime);
    metrics.endTime = new Date(metrics.endTime);
    metrics._expires = new Date(ttl + metrics.startTime.getTime());
    metrics.subShard = data.app.subShard;

    if (metrics.host) {
      metrics.host = metrics.host.substring(0, 80);
    }

    return {_id: uuid.v4(), value: metrics};
  });
}
