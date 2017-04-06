var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var pingMiddleware = require('../../lib/middlewares/ping');

var clean = mongo.cleanCollections(['apps']);

suite('middlewares/ping', function() {
  test('ping', clean(function(db, done) {
    var req = {
      url: '/ping',
      body: {}
    };

    var res = {
      writeHead: function(code) {
        statusCode = code;
      },
      end: function() {
        assert.equal(statusCode, 200);
        done();
      }
    };
    pingMiddleware()(req, res);
  }));

  test('ping another url', clean(function(db, done) {
    var req = {
      url: '/ping'+'another-url',
      body: {}
    };

    var res = {};
    var next = function(){
      done();
    }

    pingMiddleware()(req, res, next);
  }));
});