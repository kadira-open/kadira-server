var engineUtils = require('../utils');

module.exports = function () {
  return function(req, res, next) {
    var url = req._parsedUrl;
    if(req.url == '/simplentp/sync'){
      // same route used for both OPTIONS and data request
      var headers = {
        "Content-Type": "text/plain"
      };
      engineUtils.replyWithCors(req, res, 200, new Date().getTime().toString(), headers);
    } else if(url.pathname == '/simplentp/sync/jsonp') {
      var callback = req.query.callback || 'callback';
      res.writeHead(200, {'Content-Type': 'text/javascript'});
      res.end(callback+'('+Date.now().toString()+')');
    } else {
      next();
    }
  }
}
