var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var middleware = require('../../lib/middlewares/simplentp');

var clean = mongo.cleanCollections(['apps']);

suite('middlewares/simplentp', function() {
  test('simplentp', clean(function(db, done) {
    var req = {
      url: '/simplentp/sync',
      body: {},
      _parsedUrl: {
        pathname: '/simplentp/sync/'+'another-url'
      },
      headers: {}
    };

    var res = {
      writeHead: function(code, headers) {
        statusCode = code;
        allowOrigin = headers['Access-Control-Allow-Origin'];
        contentType = headers['Content-Type'];
      },
      write: function(timestamp) {
        timestamp = parseInt(timestamp);
        assert.equal(statusCode, 200);
        assert.equal(allowOrigin, '*');
        assert.equal(contentType, 'text/plain');
        assert.ok(Date.now() >= timestamp);
        done();
      },
      end: function() {}
    };
    middleware()(req, res);
  }));

  test('jsonp', clean(function(db, done) {
    var req = {
      url: '/simplentp/sync/jsonp',
      body: {},
      query: {
        callback: '_test_callback_'
      },
      _parsedUrl: {
        pathname: '/simplentp/sync/jsonp'
      }
    };

    var res = {
      writeHead: function(code) {
        statusCode = code;
      },
      end: function(script) {
        assert.equal(statusCode, 200);
        assert.equal(!!script.match(/_test_callback_\([0-9]{13}\)/), true);
        done();
      }
    };
    middleware()(req, res);
  }));

  test('another url', clean(function(db, done) {
    var req = {
      url: '/simplentp/sync/'+'another-url',
      body: {},
      _parsedUrl: {
        pathname: '/simplentp/sync/'+'another-url'
      }
    };

    var res = {};
    var next = function(){
      done();
    }

    middleware()(req, res, next);
  }));
});
