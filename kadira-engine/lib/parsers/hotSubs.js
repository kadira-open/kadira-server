var _ = require('underscore');
var uuid = require('uuid');

var HOTSUB_FILEDS = ['session', 'subId', 'pub', 'hotMetric', 'args', 'queries'];
var ACCEPTABLE_METRICS = {};
['subs', 'resTime', 'networkImpact', 'dataFetched', 'lifeTime', 'activeSubs'].forEach(function(field) {
  ACCEPTABLE_METRICS[field] = true;
});

module.exports = function(data) {
  var appId = data.appId;
  var hotSubs = data.hotSubs;
 
  if (!( appId && hotSubs )){
    return null;
  }

  var result = [];
  for (var i = 0; i < hotSubs.length; i++) {
    var doc = _.pick(hotSubs[i], HOTSUB_FILEDS);
    doc.appId = appId;
    doc.host = data.host;
    doc.startTime = new Date(hotSubs[i].startTime);
    doc.metrics = getAcceptableMetrics(hotSubs[i].metrics);
    doc.subShard = data.app.subShard
    
    doc._id = uuid.v4();
    result.push(doc);
  }

  return result;
}

function getAcceptableMetrics(metrics) {
  var accepted = {};
  for(var key in metrics) {
    if(ACCEPTABLE_METRICS[key]) {
      accepted[key] = metrics[key];
    }
  }
  return accepted;
}