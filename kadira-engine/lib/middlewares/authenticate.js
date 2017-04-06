var stateManager = require('../stateManager');

module.exports = function(db) {
  var appsCollection = db.collection('apps');

  return function(req, res, next) {
    var appId = req.appId;
    var appSecret = req.appSecret;
    if (appId && appSecret) {
      //do the authentication
      appsCollection.findOne({_id: appId, secret: appSecret}, function(err, app) {
        if(err) {
          console.error('error getting app:', {appId: appId, error: err.message});
          endRequest(500);
        } else if(app) {
          req.app = req.body.app = app;
          req.appId = req.body.appId = appId;
          req.plan = req.body.plan = app.plan;

          stateManager.setState(db, app, 'initialDataReceived');
          next();
        } else {
          endRequest(401);
        }
      });
    } else {
      endRequest(401);
    }

    function afterUpdated(err) {
      if(err) {
        //todo: do the error handling and re-try logic
        console.error('error on updating app:', {appId: appId, error: err.message});
      }
    }

    function endRequest(statusCode) {
      res.writeHead(statusCode);
      res.end();
    }
  }
}
