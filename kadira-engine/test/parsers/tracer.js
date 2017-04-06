var assert = require('assert');
var tracerParser = require('../../lib/parsers/tracer');

suite('methodRequests parser', function() {
  test('Array of methods', function() {
    var timestamp = Date.now();
    var uuid = "aaaaa";

    var post_data = {
      app: {plan: 'free'},
      "appId": "the-app-id",
      "host": "aa.dfd.com",
      "methodRequests": [
        {
          "_id": "uuid",
          "name": "methodName",
          "events": [
            {"type": "start", "data": {}, "at": timestamp},
            {"type": "db", "data": {"coll": "collname", "method": "find", "selector": {"aa": 10}}, "at": timestamp},
            {"type": "dbend", "data": {}, "at": timestamp},
            {"type": "db", "data": {"coll": "collname", "method": "insert"}, "at": timestamp},
            {"type": "dbend", "data": {}, "at": timestamp},
            {"type": "http", "data": {"id": "uid", "url": "url", "method": "GET"}, "at": timestamp},
            {"type": "httpend", "data": {"id": "uid", "statusCode": 200}, "at": timestamp},
            {"type": "complete","data": {}, "at": timestamp},
          ],
          "type": "method",
          "session": "s1",
          "errorCount": 100,
          "metrics": {total: 10}
        }
      ]
    }
    // console.log(JSON.stringify(post_data))
    var parsedData = tracerParser('methodRequests')(post_data);

    var timestamp2  = timestamp;
    var expectedResult = [
      {
        "appId": "the-app-id",
        "host": "aa.dfd.com",
        "name": "methodName",
        "events": [
          {type: "start", data: {}, at: timestamp2},
          {type: "db", data: {coll: "collname", method: "find", selector: {aa: 10}}, at: timestamp2},
          {type: "dbend", data: {}, at: timestamp2},
          {type: "db", data: {coll: "collname", method: "insert"}, at: timestamp2},
          {type: "dbend", data: {}, at: timestamp2},
          {type: "http", data: {id: 'uid', url: "url", method: 'GET'}, at: timestamp2},
          {type: "httpend", data: {id: 'uid', statusCode: 200}, at: timestamp2},
          {type: "complete",data: {}, at: timestamp2}
        ],
        "type": "method",
        "totalValue": 10,
        "session": "s1",
        "metrics": {total: 10},
        "startTime": timestamp2,
        "_expires": timestamp2 + 1000*60*60*24*2
      }
    ];

    //convert date into timestamps since deepEqual cannot compare dates
    parsedData[0].events.forEach(function(event) {
      event.at = event.at.getTime();
    });
    parsedData[0].startTime = parsedData[0].startTime.getTime();
    parsedData[0]._expires = parsedData[0]._expires.getTime();
    delete parsedData[0]._id;

    assert.deepEqual(parsedData,expectedResult);
  });

  test('Array of methods - with error', function() {
    var timestamp = Date.now();
    var uuid = "aaaaa";

    var post_data = {
      app: {plan: 'free'},
      "appId": "the-app-id",
      "host": "aa.dfd.com",
      "methodRequests": [
        {
          "_id": "uuid",
          "name": "methodName",
          "events": [
            {"type": "start", "data": {}, "at": timestamp},
            {"type": "db", "data": {"coll": "collname", "method": "find", "selector": {"aa": 10}}, "at": timestamp},
            {"type": "dbend", "data": {}, "at": timestamp},
            {"type": "db", "data": {"coll": "collname", "method": "insert"}, "at": timestamp},
            {"type": "dbend", "data": {}, "at": timestamp},
            {"type": "http", "data": {"id": "uid", "url": "url", "method": "GET"}, "at": timestamp},
            {"type": "httpend", "data": {"id": "uid", "statusCode": 200}, "at": timestamp},
            {"type": "error", data: {error: {message: 'the-error'}}, at: timestamp}
          ],
          "type": "method",
          "session": "s1",
          "errorCount": 100,
          "metrics": {total: 10},
          "errored": true
        }
      ]
    }

    var parsedData = tracerParser('methodRequests')(post_data);

    var timestamp2  = timestamp;
    var expectedResult = [
      {
        "appId": "the-app-id",
        "host": "aa.dfd.com",
        "name": "methodName",
        "events": [
          {type: "start", data: {}, at: timestamp2},
          {type: "db", data: {coll: "collname", method: "find", selector: {aa: 10}}, at: timestamp2},
          {type: "dbend", data: {}, at: timestamp2},
          {type: "db", data: {coll: "collname", method: "insert"}, at: timestamp2},
          {type: "dbend", data: {}, at: timestamp2},
          {type: "http", data: {id: 'uid', url: "url", method: 'GET'}, at: timestamp2},
          {type: "httpend", data: {id: 'uid', statusCode: 200}, at: timestamp2},
          {type: "error", data: {error: {message: 'the-error'}}, at: timestamp2}
        ],
        "type": "method",
        "totalValue": 10,
        "session": "s1",
        "metrics": {total: 10},
        "startTime": timestamp2,
        "errored": true,
        "errorMessage": "the-error",
        "_expires": timestamp2 + 1000*60*60*24*2
      }
    ];

    //convert date into timestamps since deepEqual cannot compare dates
    parsedData[0].events.forEach(function(event) {
      event.at = event.at.getTime();
    });
    parsedData[0].startTime = parsedData[0].startTime.getTime();
    parsedData[0]._expires = parsedData[0]._expires.getTime();
    delete parsedData[0]._id;

    assert.deepEqual(parsedData,expectedResult);
  });

  test('Array of methods - with error (new tracer format)', function() {
    var timestamp = Date.now();
    var uuid = "aaaaa";

    var post_data = {
      app: {plan: 'free'},
      "appId": "the-app-id",
      "host": "aa.dfd.com",
      "methodRequests": [
        {
          "_id": "uuid",
          "name": "methodName",
          "events": [
            ['start', 0],
            ['error', 0, {error: {message: 'the-error'}}]
          ],
          "type": "method",
          "session": "s1",
          "errorCount": 100,
          "metrics": {total: 10},
          "errored": true,
          "isEventsProcessed": true,
          "at": timestamp
        }
      ]
    }

    var parsedData = tracerParser('methodRequests')(post_data);

    var timestamp2  = timestamp;
    var expectedResult = [
      {
        "appId": "the-app-id",
        "host": "aa.dfd.com",
        "name": "methodName",
        "events": [
          ['start', 0],
          ['error', 0, {error: {message: 'the-error'}}]
        ],
        "type": "method",
        "totalValue": 10,
        "session": "s1",
        "metrics": {total: 10},
        "startTime": timestamp2,
        "errored": true,
        "errorMessage": "the-error",
        "isEventsProcessed": true,
        "_expires": timestamp2 + 1000*60*60*24*2
      }
    ];

    // convert date into timestamps since deepEqual cannot compare dates
    parsedData[0].startTime = parsedData[0].startTime.getTime();
    parsedData[0]._expires = parsedData[0]._expires.getTime();
    delete parsedData[0]._id;

    assert.deepEqual(parsedData,expectedResult);
  });
});