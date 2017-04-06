var uuid = require('uuid');
var expire = require('./_expire');
var PUB_METRICS_FIELDS = [
  'subs', 'unsubs', 'resTime', 'bytesBeforeReady',
  'bytesAddedAfterReady', 'bytesChangedAfterReady',
  'dataFetched', 'activeSubs', 'activeDocs', 'avgObserverReuse',
  'avgDocSize', 'lifeTime', 'subRoutes', 'unsubRoutes',
  'totalObserverHandlers', 'cachedObservers', 'createdObservers',
  'deletedObservers', 'errors',
  'polledDocuments', 'observerLifetime',
  'oplogUpdatedDocuments', 'oplogInsertedDocuments', 'oplogDeletedDocuments',
  'liveAddedDocuments', 'liveChangedDocuments', 'liveRemovedDocuments',
  'initiallyAddedDocuments', 'polledDocSize', 'fetchedDocSize',
  'initiallyFetchedDocSize', 'liveFetchedDocSize', 'initiallySentMsgSize',
  'liveSentMsgSize'
];

module.exports = function(data) {
  var appId = data.appId;
  var host  = data.host;
  var metrics = data.pubMetrics;

  if(appId && host && metrics ){
    var metricsLength = metrics.length;
    var result = [];
    var ttl = expire.getTTL(data.app);
    for (var i = 0; i < metricsLength; i++) {
      var pubDetails = metrics[i].pubs;
      var startTime = metrics[i].startTime;
      var endTime = metrics[i].endTime;

      for(var pubName in pubDetails){
        var metricsData = {
          appId: appId,
          host: host,
          pub: pubName,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          subShard: data.app.subShard
        };

        metricsData._expires = new Date(ttl + metricsData.startTime.getTime());

        var pubInfo = pubDetails[pubName];
        // field name got changed
        if(pubInfo.totalObservers) {
          pubInfo.totalObserverHandlers = pubInfo.totalObservers;
        }

        PUB_METRICS_FIELDS.forEach(function(metric) {
          if(metric == "subRoutes" || metric == "unsubRoutes"){
            metricsData[metric] = [];
            for(var route in pubInfo[metric]){
              var count = pubInfo[metric][route] || 0;
              metricsData[metric].push({name: route, count: count})
            }

          } else {
            metricsData[metric] = pubInfo[metric] || 0;
          }

        });

        if (metricsData.host) {
          metricsData.host = metricsData.host.substring(0, 80);
        }

        if (metricsData.pub) {
          metricsData.pub = metricsData.pub.substring(0, 200);
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
