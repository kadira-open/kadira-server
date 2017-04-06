var assert = require('assert');
var appStatsParser = require('../../lib/parsers/appStats');

suite('app stats parser', function() {
  test('single metric', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: "the-host",
      appId: "the-app-id",
      startTime: timestamp,
      appStats: {
        release: "the-release",
        packageVersions: {
          foo: null,
          bar: null
        },
        appVersions: [
          {name: 'webapp', version: "v-webapp"},
          {name: 'refreshable', version: "v-refreshable"},
          {name: 'cordova', version: "v-cordova"},
        ]
      }
    };
    var expectedResult = [
      {
        value: {
          host: "the-host",
          appId: "the-app-id",
          startTime: timestamp,
          release: "the-release",
          packageVersions: {
            foo: null,
            bar: null
          },
          appVersions: [
            {name: 'webapp', version: "v-webapp"},
            {name: 'refreshable', version: "v-refreshable"},
            {name: 'cordova', version: "v-cordova"},
          ]
        }
      }
    ];
    var out = appStatsParser(postData);
    out[0].value.startTime = out[0].value.startTime.getTime();
    delete out[0]._id;
    assert.deepEqual(out, expectedResult);
  });
});
