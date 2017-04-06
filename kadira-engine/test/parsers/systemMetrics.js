var assert = require('assert');
var systemMetricsParser = require('../../lib/parsers/systemMetrics');

suite('system metrics parser', function() {
  test('Array of metrics', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var timestamp2 = timestamp+500;
    var postData = {
      app: {appId: "the-app-id", plan: 'business', subShard: 87},
      host: "the-host",
      "appId": "the-app-id",
      systemMetrics: [
        {
          memory: 123456,
          loadAverage: 1.234,
          pctEvloopBlock: 123,
          sessions: 45,
          startTime: timestamp,
          endTime: timestamp2,
          totalTime: 500,
          gcScavengeCount: 10,
          gcScavengeDuration: 100,
          gcFullCount: 1,
          gcFullDuration: 20,
        }
      ]
    };
    var expectedResult = [
      {
        value: {
          host: "the-host",
          appId: "the-app-id",
          memory: 123456,
          loadAverage: 1.234,
          pctEvloopBlock: 123,
          sessions: 45,
          startTime: timestamp,
          endTime: timestamp2,
          _expires: timestamp + 1000 * 60 * 60 * 24 * 97,
          totalTime: 500,
          gcScavengeCount: 10,
          gcScavengeDuration: 100,
          gcFullCount: 1,
          gcFullDuration: 20,
          subShard: 87
        }
      }
    ];
    var out = systemMetricsParser(postData);
    out[0].value.startTime = out[0].value.startTime.getTime();
    out[0].value.endTime = out[0].value.endTime.getTime();
    out[0].value._expires = out[0].value._expires.getTime();
    delete out[0]._id;
    assert.deepEqual(expectedResult, out);
  });
});

function pick (obj) {
  var keys = Object.keys(obj).sort();
  var newObj = {};
  keys.forEach(function(key) {
    newObj[key] = obj[key];
  });

  return newObj;
}
