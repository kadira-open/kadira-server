var assert = require('assert');
var forward = require('../../lib/middlewares/forward');

suite('middlewares/forward', function () {
  var requestParams = [];
  var originalRequest = forward.request;
  var mockedRequest = function (params) {
    requestParams.push(params);
  };

  setup(function () {
    forward.request = mockedRequest;
  });

  teardown(function () {
    forward.request = originalRequest;
  });

  test('forward all data', function() {
    var url = 'http://test-url.com:3000/';
    var req = {
      url: '/test-url',
      method: 'test-method',
      body: {foo: 'bar'},
      headers: {
        'ignored-header': 'baz',
        'kadira-app-id': 'test-app',
        'kadira-app-secret': 'test-secret',
      }
    };

    var nextCalled = false;
    forward(url)(req, null, function () {
      nextCalled = true;
    });

    assert.equal(requestParams.length, 1);
    var params = requestParams.pop();

    assert.deepEqual(params, {
      url: 'http://test-url.com:3000/test-url',
      json: true,
      body: {foo: 'bar'},
      method: 'test-method',
      headers: {
        'kadira-app-id': 'test-app',
        'kadira-app-secret': 'test-secret',
      }
    });
  });
});
