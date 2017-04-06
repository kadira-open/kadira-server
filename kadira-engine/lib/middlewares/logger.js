var SOURCE = require('os').hostname();
var PREFIX = process.env.LIBRATO_PREFIX || "";
var EventLoopMonitor = require('evloop-monitor');

module.exports = function() {
  var intervalSendingMetrics = 1000 * 10; //10 secs
  var eventLoopMonitor = new EventLoopMonitor(200);
  eventLoopMonitor.start();

  var apiHits = resetHits();
  if(process.env.LIBRATO_EMAIL && process.env.LIBRATO_TOKEN) {
    var client = require('librato-metrics').createClient({
      email: process.env.LIBRATO_EMAIL,
      token: process.env.LIBRATO_TOKEN
    });
    sendMetrics(client);
  }

  return function(req, res, next) {
    next();
    apiHits.total++;

    if(req.body.methodMetrics){
      apiHits.methodMetrics += req.body.methodMetrics.length;
    }
    if(req.body.methodRequests){
      apiHits.methodRequests += req.body.methodRequests.length;    
    }

    apiHits.apps[req.body.appId] = true;
  }

  function sendMetrics(client) {
    var metrics = processMetrics();
    if(metrics) {
      var gauges = [];
      for(var key in metrics) {
        gauges.push({
          name: PREFIX + key, 
          value: metrics[key],
          source: SOURCE
        });
      }

      client.post('/metrics', {gauges: gauges}, afterSent);
    } else {
      scheduleSend();
    }

    function afterSent(err) {
      if(err) {
        console.error('error sending to librato: ', err.message);
      }
      scheduleSend();
    }

    function scheduleSend() {
      setTimeout(function() {
        sendMetrics(client);
      }, intervalSendingMetrics);
    }
  } 

  function processMetrics(){
    //converting metrics into per sec values
    var elaspsedSecs = (Date.now() - apiHits.resetAt)/1000;
    if(elaspsedSecs <= 0) return false;

    var metrics = {};
    ['total', 'methodMetrics', 'methodRequests'].forEach(function(field) {
      metrics['engine_' + field] = apiHits[field] / elaspsedSecs;
    });

    metrics.engine_apps = Object.keys(apiHits.apps).length;
    metrics.engine_mem = process.memoryUsage().rss / (1024 * 1024);
    metrics.eventloop_blockness = eventLoopMonitor.status().pctBlock;

    apiHits = resetHits();
    return metrics;
  }

  function resetHits() {
    return {
      total: 0,
      methodMetrics: 0,
      methodRequests: 0,
      apps: {},
      resetAt: Date.now()
    };
  }
};