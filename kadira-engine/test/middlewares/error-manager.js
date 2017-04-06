var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var errorManagerMiddleware = require('../../lib/middlewares/error-manager');

var clean = mongo.cleanCollections(['rawErrorMetrics','errorTraces']);

suite('middlewares/error-manager', function() {
  test('GET request (deprecated)', clean(function(db, done) {
    var receivedRawErrorMetrics = false, receivedErrorTraces = false;
    var req = {
      method: 'GET',
      headers: {},
      connection: {remoteAddress: '10.0.0.1'},
      query: getInvalidPayload()
    };
    var res = {
      writeHead: function(statusCode) {
        assert.equal(statusCode, 403);
        done();
      },
      write: Function.prototype,
      end: Function.prototype
    };

    var appDb = {collection: function() {}};
    errorManagerMiddleware(appDb, null)(req, res, Function.prototype);
  }));

  test('POST request', clean(function(db, done) {
    var receivedRawErrorMetrics = false, receivedErrorTraces = false;
    var req = {
      method: 'POST',
      headers: {},
      connection: {remoteAddress: '10.0.0.1'},
      body: getValidPayload()
    };
    var res = {
      writeHead: Function.prototype,
      write: Function.prototype,
      end: Function.prototype
    };
    var resultTests = {
      rawErrorMetrics: function (data) {
        receivedRawErrorMetrics = true;
        var expected = {
          appId: 'test-app',
          host: 'some-host',
          name: 'test-error',
          type: 'client',
          subType: 'zone',
          subShard: 78,
          count: 1
        };
        delete data[0].value.startTime;
        delete data[0].value._expires;
        assert.deepEqual(expected, data[0].value);
      },
      errorTraces: function (data) {
        receivedErrorTraces = true;
        delete data[0]._id;
        delete data[0].randomId;
        delete data[0].events;
        delete data[0].compressed;
        var expected = {
          appId: 'test-app',
          host: 'some-host',
          name: 'test-error',
          type: 'client',
          subType: 'zone',
          info: 'test-info',
          startTime: 100000000000,
          _expires: 108380800000,
          stacks: []
        };
        data[0].startTime = data[0].startTime.getTime();
        data[0]._expires = data[0]._expires.getTime();
        assert.deepEqual(expected, data[0]);
      }
    };
    var metricDb = {
      collection: function (collectionName) {
        return {
          insert: function (errors) {
            resultTests[collectionName](errors);
            if(receivedErrorTraces && receivedRawErrorMetrics) {
              done();
            }
          }
        }
      }
    };
    var appDb = {
      collection: function (collectionName) {
        return {
          findOne: function (query, callback) {
            callback(null, {plan: 'pro', shard: "one", subShard: 78});
          },

          update: function() {}
        };
      }
    };

    var mongoCluster = {
      getConnection: function (shard) {
        assert.equal(shard, "one");
        return metricDb;
      }
    };

    errorManagerMiddleware(appDb, mongoCluster)(req, res, Function.prototype);
  }));

});

// ------------------------------------------------------------------------- \\

// startTime is set to 100000000000 so it'll be easy to test whether the
// correct value for _expires (which should be 115552000000) is set properly
function getInvalidPayload () {
  return {
    host: 'some-host',
    errors: JSON.stringify([
    {
      "appId": "test-app",
      "name": "test-error",
      "type": "client",
      "startTime": 100000000000,
      "subType": "zone",
      "info": 'test-info',
      "stacks": [],
      "count": 1
    }
  ])};
}

function getValidPayload () {
  return {
    host: 'some-host',
    errors: [
    {
      "appId": "test-app",
      "name": "test-error",
      "type": "client",
      "startTime": 100000000000,
      "subType": "zone",
      "info": 'test-info',
      "stacks": [],
      "count": 1
    }
  ]};
}
