var uuid = require('uuid');
var expire = require('./_expire');
var METHOD_METRICS_FIELDS = [
  'wait', 'db', 'http', 'email', 'async', 'compute', 'total', 'errors',
  'count', 'fetchedDocSize', 'sentMsgSize'
];

module.exports = function(data) {
  var appId = data.appId;
  var host  = data.host;
  var metrics = data.methodMetrics;

  if(appId && host && metrics ){
    var metricsLength = metrics.length;
    var result = [];
    var ttl = expire.getTTL(data.app);
    for (var i = 0; i < metricsLength; i++) {
      var methodDetails = metrics[i].methods;
      var startTime = metrics[i].startTime;
      var endTime = metrics[i].endTime;

      for(var methodName in methodDetails){
        var metricsData = {
          appId: appId,
          host: host,
          name: methodName,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          subShard: data.app.subShard
        };

        metricsData._expires = new Date(ttl + metricsData.startTime.getTime());

        var method = methodDetails[methodName];

        METHOD_METRICS_FIELDS.forEach(function(metric) {
          if(method[metric] === undefined) {
            metricsData[metric] = 0;
          } else {
            metricsData[metric] = method[metric];
          }
        });

        if (metricsData.host) {
          metricsData.host = metricsData.host.substring(0,80);
        }

        if (metricsData.name) {
          metricsData.name = metricsData.name.substring(0,200);
        }

        //value key is used to match the format used by the result of map-reduce
        //keeping same format is very important to use a common code for the pre-aggregation
        //so we can use different aggregation formats by simply changinging collection name
        result.push({_id: uuid.v4(), value: metricsData});
      }
    }
  } else {
    return null;
  }

  return result;
}
