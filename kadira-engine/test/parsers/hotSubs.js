var assert = require('assert');
var hotSubsParser = require('../../lib/parsers/hotSubs');

suite('hotSubs parser', function() {
  test('Array of hotSubs', function() {
    var timestamp = Date.now();

    var post_data = {
      app: {plan: 'free', subShard: 87},
      "appId": "the-app-id",
      "host": "aa.dfd.com",
      "hotSubs": [
        {
          "_id": "uuid",
          "session": "s1",
          "subId": "ccc-sub-id",
          "pub": "postList",
          "hotMetric": "resTime",
          "metrics": {
            "subs": 10,
            "resTime": 8,
            "networkImpact": 4,
            "dataFetched": 12,
            "lifeTime": 45,
            "activeSubs": 101,
            "garbageData": 4343 //this will be removed
          },
          "args": [],
          "queries": [],
          "startTime": timestamp
        }
      ]
    }
    // console.log(JSON.stringify(post_data))
    var parsedData = hotSubsParser(post_data);

    var timestamp2  = timestamp;
    var expectedResult = [
      {
        "appId": "the-app-id",
        "host": "aa.dfd.com",
        "session": "s1",
        "subId": "ccc-sub-id",
        "subShard": 87,
        "pub": "postList",
        "hotMetric": "resTime",
        "metrics": {
          "subs": 10,
          "resTime": 8,
          "networkImpact": 4,
          "dataFetched": 12,
          "lifeTime": 45,
          "activeSubs": 101
        },
        "args": [],
        "queries": [],
        "startTime": timestamp
      }
    ];

    parsedData[0].startTime = parsedData[0].startTime.getTime();
    delete parsedData[0]._id;
    
    assert.deepEqual(parsedData,expectedResult);
  });
});