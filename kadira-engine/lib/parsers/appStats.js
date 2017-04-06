var _ = require('underscore');
var uuid = require('uuid');

var APP_STATS_FIELDS = ['release', 'packageVersions', 'appVersions'];

module.exports = function (data) {
  if(!(data.appId && data.appStats)) return null;
  var metrics = _.pick(data.appStats, APP_STATS_FIELDS);
  metrics.appId = data.appId;
  metrics.host = data.host;
  metrics.startTime = new Date(data.startTime);
  return [{_id: uuid.v4(), value: metrics}];
}
