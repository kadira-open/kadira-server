var assert = require('assert');
var corsOptionsMiddleware = require('../../lib/middlewares/cors-options');

suite('middlewares/cors-options', function() {
  test('OPTIONS request - no origin', function(done) {
    var statusCode, headers, response;
    var req = {method: 'OPTIONS', headers: {}};
    var res = {
      writeHead: function (_statusCode, _headers) {
        statusCode = _statusCode;
        headers = _headers;
      },
      write: function (_response) {
        response = _response;
      },
      end: function () {
        assert.equal(statusCode, 200);
        assert.equal(headers['Access-Control-Allow-Origin'], '*');
        done();
      }
    };
    var metricDb = {};
    var appDb = {collection: Function.prototype};

    corsOptionsMiddleware(req, res, Function.prototype);
  });

  test('OPTIONS request - have origin', function(done) {
    var statusCode, headers, response;
    var req = {method: 'OPTIONS', headers: {'origin': 'the-origin'}};
    var res = {
      writeHead: function (_statusCode, _headers) {
        statusCode = _statusCode;
        headers = _headers;
      },
      write: function (_response) {
        response = _response;
      },
      end: function () {
        assert.equal(statusCode, 200);
        assert.equal(headers['Access-Control-Allow-Origin'], 'the-origin');
        done();
      }
    };
    var metricDb = {};
    var appDb = {collection: Function.prototype};

    corsOptionsMiddleware(req, res, Function.prototype);
  });
});
