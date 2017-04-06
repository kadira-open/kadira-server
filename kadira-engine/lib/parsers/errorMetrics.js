var _ = require('underscore');
var uuid = require('uuid');
var expire = require('./_expire');

var ERROR_METRICS_FIELDS = [
  'appId', 'name', 'type', 'subType', 'startTime',
  'count',
  'source' // deprecated
];

module.exports = function(data) {
  var ttl = expire.getTTL(data.app);

  if(data.errors) {
    return data.errors.map(formatMetrics);
  } else {
    return null;
  };

  function formatMetrics (_metrics) {
    var metrics = _.pick(_metrics, ERROR_METRICS_FIELDS);
    if(typeof metrics.name !== 'string') {
      metrics.name = JSON.stringify(metrics.name);
    }

    metrics.host = data.host;
    metrics.count = metrics.count || 1;
    metrics.startTime = new Date(parseInt(metrics.startTime));
    metrics._expires = new Date(ttl + metrics.startTime.getTime());
    metrics.subShard = data.app.subShard;

    if (metrics.source) {
      metrics.type = metrics.source;
      metrics.source = null;
    }

    if (metrics.name) {
      metrics.name = metrics.name.substring(0, 200);
    }

    if (metrics.type) {
      metrics.type = metrics.type.substring(0, 200);
    }

    if (metrics.subType) {
      metrics.subType = metrics.subType.substring(0, 200);
    }

    if (metrics.host) {
      metrics.host = metrics.host.substring(0, 80);
    }

    return {_id: uuid.v4(), value: metrics};
  }
};
