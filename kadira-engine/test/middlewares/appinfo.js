var assert = require('assert');
var appInfoMiddleware = require('../../lib/middlewares/appinfo');

suite('middlewares/appinfo', function() {
  test('get from headers', function () {
    var req = {
      url: '/not-errors',
      headers: {
        'kadira-app-id': 'appId'+Math.random(),
        'kadira-app-secret': 'appSecret'+Math.random()
      }
    };
    appInfoMiddleware(req, {}, Function.prototype);
    assert.equal(req.appId, req.headers['kadira-app-id'])
    assert.equal(req.appSecret, req.headers['kadira-app-secret'])
  });

  test('get from headers (v2.12.2 and older)', function () {
    var req = {
      url: '/not-errors',
      headers: {
        'apm-app-id': 'appId'+Math.random(),
        'apm-app-secret': 'appSecret'+Math.random()
      }
    };
    appInfoMiddleware(req, {}, Function.prototype);
    assert.equal(req.appId, req.headers['apm-app-id'])
    assert.equal(req.appSecret, req.headers['apm-app-secret'])
  });

  test('get from errors', function () {
    var req = {
      url: '/errors',
      headers: {},
      body: {errors: [{ 'appId': 'appId'+Math.random() }]}
    };
    appInfoMiddleware(req, {}, Function.prototype);
    assert.equal(req.appId, req.body.errors[0].appId)
  });
});
