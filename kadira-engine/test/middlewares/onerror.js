var assert = require('assert');
var onErrorMiddleware = require('../../lib/middlewares/onerror');

suite('middlewares/onerror', function() {
  test('handle errors with 500 status code', function (done) {
    var req = {app: {_id: "the-id"}};
    var errorsLogs = "";
    var m = onErrorMiddleware();
    var res = {
      writeHead: function(code) {
        assert.equal(code, 500);
      },
      end: function() {
        assert.ok(/the-error/.test(errorsLogs));
        done();
      }
    };

    WithNewConsoleError(function() {
      m(new Error("the-error"), req, res);
    }, function(message) {
      errorsLogs = message;
    });
  });

  test('handle JSON parse errors with no logs', function (done) {
    var req = {app: {_id: "the-id"}};
    var errorsLogs = "";
    var m = onErrorMiddleware();
    var res = {
      writeHead: function(code) {
        assert.equal(code, 500);
      },
      end: function() {
        assert.equal(errorsLogs, "ERROR[the-id] : JSON parse error");
        done();
      }
    };

    WithNewConsoleError(function() {
      var error = new Error();
      error.stack = "**** /types/json.js ****";
      m(error, req, res);
    }, function(message) {
      errorsLogs = message;
    });
  });
});

function WithNewConsoleError(cb, newError) {
  var originalConsoleError = console.error;
  console.error = newError;
  cb();
  console.error =originalConsoleError;
}