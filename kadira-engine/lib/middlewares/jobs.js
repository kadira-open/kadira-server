var engineUtils = require('../utils');

module.exports = jobs = function(appDb, metricsDb) {
  var actions = jobs._getActions(appDb);
  return function(req, res, next) {
    var body = req.body;
    if(!body || !(body.action)) {
      return engineUtils.replyWithCors(req, res, 403, 'no action specified');
    }

    if(!body.params) {
      return engineUtils.replyWithCors(req, res, 403, 'params required!');
    }

    var action = actions[body.action];
    if(!action) {
      return engineUtils.replyWithCors(req, res, 403, 'no such action found: ' + body.action);
    }

    action(req.appId, body.params, function(err, response) {
      if(err) {
        console.error(
          'error while processing action: %s with payload: %s - error message: ',
          body.action, JSON.stringify(body), err.message);
        return engineUtils.replyWithCors(req, res, 500, 'internal server error');
      } else {
        engineUtils.replyWithCors(req, res, 200, response);
      }
    });
  };
};

module.exports._getActions = function(appDb) {
  var jobsCollection = appDb.collection('jobs')

  return {
    get: function(appId, params, callback) {
      if(params.id) {
        jobsCollection.findOne({_id: params.id, appId: appId}, callback);
      } else {
        callback(new Error('id parameter required to get the job'));
      }
    },

    set: function(appId, params, callback) {
      if(params.id) {
        var updateFields = {
          updatedAt: new Date()
        };

        if(params.state) {
          updateFields.state = params.state;
        }

        if(params.data) {
          for(var key in params.data) {
            updateFields['data.' + key] = params.data[key];
          }
        }

        jobsCollection.update({_id: params.id, appId: appId}, {$set: updateFields}, callback);
      } else {
        callback(new Error('id parameter required to set the job'));
      }
    }
  };
};