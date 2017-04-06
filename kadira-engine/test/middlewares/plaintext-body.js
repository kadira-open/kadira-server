var assert = require('assert');
var plaintextMiddleware = require('../../lib/middlewares/plaintext-body');

suite('middlewares/plaintext-body', function() {
  test('xhr data', function(done) {
    var req = {
      headers: {'content-type': 'application/json'},
      body: 'this should not change'
    };

    var next = function () {
      assert.equal(req.body, 'this should not change');
      done();
    };

    plaintextMiddleware(req, {}, next);
  });

  test('xdr data', function(done) {
    var encoding, onArgs = [];
    var req = {
      headers: {},
      body: {},
      setEncoding: function (type) {
        encoding = type;
      },
      on: function (type, callback) {
        if(type === 'data') {
          setTimeout(callback.bind(this, '{"foo"'), 0);
          setTimeout(callback.bind(this, ':"bar"}'), 10);
        } else if(type === 'end') {
          setTimeout(callback, 50);
        }
      }
    };

    var next = function () {
      assert.equal(encoding, 'utf8');
      assert.deepEqual(req.body, {foo: 'bar'});
      done();
    };

    plaintextMiddleware(req, {}, next);
  });

});
