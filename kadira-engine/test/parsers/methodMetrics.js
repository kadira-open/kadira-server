var assert = require('assert');
var methodMetricsParser = require('../../lib/parsers/methodMetrics');

suite('method metrics parser', function() {
  test('Array of metrics', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var timestamp2 = timestamp+500;
    var postData = {
      app: {plan: 'free', subShard: 87},
      host: "the-host",
      "appId": "the-app-id",
      methodMetrics: [
        {
          startTime: timestamp,
          endTime: timestamp2,
          methods: {
            'methodName': {
              db: 233,
              http: 343,
              email: 34,
              async: 345,
              compute: 34,
              count: 45,
              errors: 4,
              total: 5
            }
          }
        }
      ]
    };

    var expectedResult = [
      {
        value: {
          appId: "the-app-id",
          host: "the-host",
          name: "methodName",
          startTime: timestamp,
          endTime: timestamp2,
          _expires: timestamp + 1000*60*60*24*2,
          db: 233,
          http: 343,
          email: 34,
          async: 345,
          compute: 34,
          count: 45,
          errors: 4,
          total: 5,
          wait: 0,
          subShard: 87,
          fetchedDocSize: 0,
          sentMsgSize: 0
        }
      }
    ];


    //console.log(JSON.stringify(postData));
    var parsedData = methodMetricsParser(postData);
    //to convert dates, which can be compared
    parsedData[0].value.startTime = parsedData[0].value.startTime.getTime();
    parsedData[0].value.endTime = parsedData[0].value.endTime.getTime();
    parsedData[0].value._expires = parsedData[0].value._expires.getTime();
    delete parsedData[0]._id;

    assert.deepEqual(parsedData,expectedResult);
  });
});