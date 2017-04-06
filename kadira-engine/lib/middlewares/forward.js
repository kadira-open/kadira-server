var _ = require('underscore');
var url = require('url')

module.exports = function (baseUrl) {
  var HEADERS_WHITELIST = module.exports.HEADERS_WHITELIST;
  var request = module.exports.request;
  var parsedUrl = url.parse(baseUrl);

  return function (req, res, next) {
    next();

    parsedUrl.pathname = req.url;
    var forwardUrl = url.format(parsedUrl);

    var params = {
      url: forwardUrl,
      method: req.method,
      headers: _.pick(req.headers, HEADERS_WHITELIST),
      json: true,
      body: req.body,
    };

    request(params, function(err, res, body) {
      // no need to do anything with these
    });
  };
}

// make sure dependencies can be mocked (for tests)
module.exports.request = require('request');
module.exports.HEADERS_WHITELIST = [
  'kadira-app-id',
  'kadira-app-secret',
  'apm-app-id',
  'apm-app-secret',
];
