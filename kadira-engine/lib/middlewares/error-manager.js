var assert = require('assert');
var connect = require ('connect');
var stateManager = require('../stateManager');
var engineUtils = require('../utils');

var persisters = {
  collection: require('../persisters/collection'),
  trace: require('../persisters/trace')
};

module.exports = function (appDb, metricsCluster) {
  var metricsParser = require('../parsers/errorMetrics');
  var metricsPersister = persisters.collection('rawErrorMetrics', metricsCluster);

  var traceParser = require('../parsers/errorTraces');
  var tracePersister = persisters.trace('errorTraces', metricsCluster);

  var appsCollection = appDb.collection('apps');

  return function (req, res, next) {
    var url = req._parsedUrl;
    var ipAddress = getIpAddress(req);
    var data = req.body;

    if(!data || !(data.errors instanceof Array)) {
      console.warn("data.errors should be an array");
      return reply(req, res, "errors should be an array");
    }

    // make sure errors are valid
    // TODO improve error validation
    var errors = [];
    data.errors.forEach(function(error) {
      if(error && error.appId) {
        error.info = error.info || {};
        error.info.ip = ipAddress;
        errors.push(error);
      }
    });

    // make sure there are some valid errors to process
    if(!errors.length) {
      reply(req, res, "Empty errors");
      return;
    }

    var appId = errors[0].appId;
    appsCollection.findOne({_id: appId}, function (err, app) {
      if(err) {
        console.error(err);
        console.error(err.stack);
        reply(req, res, 'Invalid Data');
        return;
      } else if(!app) {
        console.warn('No such app: ', appId);
        reply(req, res, 'No Such App');
      } else {
        var payload = {
          app: app,
          host: data.host,
          plan: app.plan,
          errors: errors
        }

        metricsPersister(app, metricsParser(payload));
        tracePersister(app, traceParser(payload));
        reply(req, res);

        // track initial state
        stateManager.setState(appDb, app, 'initialErrorsReceived');
      }
    });
  };
};

function getIpAddress (req) {
  return req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0]
    : req.connection.remoteAddress;
}

function reply (req, res, err) {
  // add cors headers
  var response = err ? {error: err} : {success: true};
  var statusCode = err? 403 : 200;
  engineUtils.replyWithCors(req, res, statusCode, response);
}
