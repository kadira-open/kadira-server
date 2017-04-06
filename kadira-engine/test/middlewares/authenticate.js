var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var authenticateMiddleware = require('../../lib/middlewares/authenticate');

var clean = mongo.cleanCollections(['apps']);

suite('middlewares/authenticate', function() {
  test('no app info', clean(function(db, done) {
    var res = {
      writeHead: function(code) {
        statusCode = code;
      },
      end: function() {
        assert.equal(statusCode, 401);
        done();
      }
    };
    var req = {headers: {}};
    authenticateMiddleware(db)(req, res);
  }));

  test('no userdata on db', clean(function(db, done) {
    var res = {
      writeHead: function(code) {
        statusCode = code;
      },
      end: function() {
        assert.equal(statusCode, 401);
        done();
      }
    };
    var req = {
      'appId': 'no-such-id',
      'appSecret': 'no-such-secret',
    };
    authenticateMiddleware(db)(req, res);
  }));

  test('user exists in the db', clean(function(db, done) {
    var appId = 'the-id';
    var appSecret = 'the-secret';

    var req = {
      'appId': appId,
      'appSecret': appSecret,
      body: {}
    };

    db.collection('apps').insert({_id: appId, secret: appSecret}, function(err) {
      if(err) throw err;
      authenticateMiddleware(db)(req, null, next);
    });

    function next() {
      assert.equal(req.appId, appId);
      assert.equal(req.body.appId, appId);
      // check exisitance of the req.app
      assert.equal(req.app._id, appId);
      done();
    }
  }));

  test('user exists in the db - app has plan', clean(function(db, done) {
    var appId = 'the-id';
    var appSecret = 'the-secret';
    var plan = 'my-plan';

    var req = {
      'appId': appId,
      'appSecret': appSecret,
      body: {}
    };

    db.collection('apps').insert({_id: appId, secret: appSecret, plan: 'my-plan'}, function(err) {
      if(err) throw err;
      authenticateMiddleware(db)(req, null, next);
    });

    function next() {
      assert.equal(req.appId, appId);
      assert.equal(req.body.appId, appId);
      assert.equal(req.body.plan, plan);
      // check exisitance of the req.app
      assert.equal(req.app._id, appId);
      done();
    }
  }));
});
