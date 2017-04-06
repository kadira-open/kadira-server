module.exports = function(config) {
  config = config || {};
  config.limit = config.limit || 10;
  config.resetTimeout = config.resetTimeout || 1000;
  config.limitTotalTraces = config.limitTotalTraces || 100;

  var ratesPerApp = {};

  setInterval(function() {
    ratesPerApp = {};
  }, config.resetTimeout);

  return function(req, res, next) {
    var data = req.body;
    var appId = req.appId;

    if(!appId) {
      console.warn("blocked due missing appId: ", req.url);
      res.writeHead(401);
      res.end();
      return;
    }

    ratesPerApp[appId] = ratesPerApp[appId] || 0;
    ratesPerApp[appId]++;

    if(ratesPerApp[appId] > config.limit) {
      console.warn("blocked due to high throughput - appId: ", appId);
      res.writeHead(429);
      res.end();
    } else if (totalTraceLimitExceeds(data)){
      console.warn("blocked due to high totalTraceLimit - appId: ", appId);
      res.writeHead(430);
      res.end();
    } else {
      next();
    }
  };

  function totalTraceLimitExceeds(data) {
    if(!data) {
      return false;
    } else {
      var totalTraces = 0;
      totalTraces += (data.methodRequests)? data.methodRequests.length: 0;
      totalTraces += (data.pubRequests)? data.pubRequests.length: 0;

      return totalTraces > config.limitTotalTraces;
    }
  }
};
