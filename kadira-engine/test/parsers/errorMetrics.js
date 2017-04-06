var assert = require('assert');
var errorMetricsParser = require('../../lib/parsers/errorMetrics');

suite('error metrics parser', function() {
  test('Array of metrics', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var getData = {
      host: 'some-host',
      app: {plan: 'free', subShard: 87},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: 'server-crash',
          startTime: timestamp,
          subType: 'uncaught',
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          trace: {
            at: timestamp,
            type: 'method',
            name: 'This is the Error Name',
            events: []
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              events: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', 'arg2']
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = [
      {
        value: {
          appId: 'dhdfsd6757sfs',
          host: 'some-host',
          name: 'This is the Error Name',
          type: 'server-crash',
          subType: 'uncaught',
          startTime: timestamp,
          count: 1,
          _expires: timestamp + 1000*60*60*24*2,
          subShard: 87
        }
      }
    ];
    var out = errorMetricsParser(getData);
    out[0].value.startTime = out[0].value.startTime.getTime();
    out[0].value._expires = out[0].value._expires.getTime();
    assert.equal(!!out[0]._id, true);
    delete out[0]._id;
    assert.deepEqual(out, expectedResult);
  });

  test('Array of metrics (with source/type - deprecated)', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var getData = {
      host: 'some-host',
      app: {plan: 'free', subShard: 87},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          source: 'client, method:*, sub:*',
          startTime: timestamp,
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          trace: {
            at: timestamp,
            type: 'method',
            name: 'This is the Error Name',
            events: []
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              events: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', 'arg2']
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = [
      {
        value: {
          appId: 'dhdfsd6757sfs',
          host: 'some-host',
          name: 'This is the Error Name',
          type: 'client, method:*, sub:*',
          source: null,
          startTime: timestamp,
          count: 1,
          _expires: timestamp + 1000*60*60*24*2,
          subShard: 87
        }
      }
    ];
    var out = errorMetricsParser(getData);
    out[0].value.startTime = out[0].value.startTime.getTime();
    out[0].value._expires = out[0].value._expires.getTime();
    assert.equal(!!out[0]._id, true);
    delete out[0]._id;
    assert.deepEqual(out, expectedResult);
  });

  test('Array of metrics (with count)', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var getData = {
      host: 'some-host',
      app: {plan: 'free', subShard: 87},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: 'client',
          subType: 'zones',
          startTime: timestamp,
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          trace: {
            at: timestamp,
            type: 'method',
            name: 'This is the Error Name',
            events: []
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              events: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', 'arg2']
                }
              ]
            }
          ],
          count: 5
        }
      ]
    }
    var expectedResult = [
      {
        value: {
          appId: 'dhdfsd6757sfs',
          host: 'some-host',
          name: 'This is the Error Name',
          type: 'client',
          subType: 'zones',
          startTime: timestamp,
          count: 5,
          _expires: timestamp + 1000*60*60*24*2,
          subShard: 87
        }
      }
    ];
    var out = errorMetricsParser(getData);
    out[0].value.startTime = out[0].value.startTime.getTime();
    out[0].value._expires = out[0].value._expires.getTime();
    assert.equal(!!out[0]._id, true);
    delete out[0]._id;
    assert.deepEqual(out, expectedResult);
  });

  test('Array of metrics (with object for name)', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var getData = {
      host: 'some-host',
      app: {plan: 'free', subShard: 87},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: {foo: 'bar'},
          type: 'client',
          subType: 'zones',
          startTime: timestamp,
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          trace: {
            at: timestamp,
            type: 'method',
            name: 'This is the Error Name',
            events: []
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              events: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', 'arg2']
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = [
      {
        value: {
          appId: 'dhdfsd6757sfs',
          host: 'some-host',
          name: '{"foo":"bar"}',
          type: 'client',
          subType: 'zones',
          startTime: timestamp,
          count: 1,
          _expires: timestamp + 1000*60*60*24*2,
          subShard: 87
        }
      }
    ];
    var out = errorMetricsParser(getData);
    out[0].value.startTime = out[0].value.startTime.getTime();
    out[0].value._expires = out[0].value._expires.getTime();
    assert.equal(!!out[0]._id, true);
    delete out[0]._id;
    assert.deepEqual(out, expectedResult);
  });

});
