var _ = require('underscore');

module.exports = AppInfo;
function AppInfo (req, res, next) {
  var appInfo = getFromHeaders(req) || getFromErrors(req) || {};
  _.extend(req, appInfo);
  next();
}

AppInfo.getFromHeaders = getFromHeaders;
function getFromHeaders (req) {
  var appId = req.headers['kadira-app-id'];
  var appSecret = req.headers['kadira-app-secret'];

  // support v2.12.2 and older clients
  if(!appId && req.headers['apm-app-id']) {
    appId = req.headers['apm-app-id'];
    appSecret = req.headers['apm-app-secret'];
  }

  if(appId && appSecret) {
    return {appId: appId, appSecret: appSecret};
  }
}

AppInfo.getFromErrors = getFromErrors;
function getFromErrors (req) {
  if(req.body && req.body.errors instanceof Array) {
    var error = req.body.errors[0];
    if(error && error.appId) {
      return {appId: error.appId}
    }
  }
}
