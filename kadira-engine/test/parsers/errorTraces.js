var assert = require('assert');
var errorTracesParser = require('../../lib/parsers/errorTraces');

suite('error traces parser', function() {
  test('Array of traces', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: 'client, method:*, sub:*',
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
                  args: [100, 'arg1', {foo: 'bar'}]
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = [
      {
        // _id: ???
        appId: 'dhdfsd6757sfs',
        host: 'some-host',
        name: 'This is the Error Name',
        type: 'client, method:*, sub:*',
        startTime: timestamp,
        // randomId: ???,
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
                args: "[100,\"arg1\",{\"foo\":\"bar\"}]"
              }
            ]
          }
        ],
        _expires: timestamp + 1000*60*60*24*2,
      }
    ];
    var out = errorTracesParser(postData);
    out[0].startTime = out[0].startTime.getTime();
    out[0]._expires = out[0]._expires.getTime();
    assert.equal(!!out[0]._id, true);
    assert.equal(!!out[0].randomId, true);
    delete out[0]._id;
    delete out[0].randomId;
    assert.deepEqual(out, expectedResult);
  });

  test('Array of traces (with source/type - deprecated)', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          source: 'client, method:*, sub:*',
          startTime: timestamp,
          type: 'uncaught',
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
                  args: [100, 'arg1', {foo: 'bar'}]
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = [
      {
        // _id: ???
        appId: 'dhdfsd6757sfs',
        host: 'some-host',
        name: 'This is the Error Name',
        type: 'client, method:*, sub:*',
        source: null,
        startTime: timestamp,
        // randomId: ???,
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
                args: "[100,\"arg1\",{\"foo\":\"bar\"}]"
              }
            ]
          }
        ],
        _expires: timestamp + 1000*60*60*24*2,
      }
    ];
    var out = errorTracesParser(postData);
    out[0].startTime = out[0].startTime.getTime();
    out[0]._expires = out[0]._expires.getTime();
    assert.equal(!!out[0]._id, true);
    assert.equal(!!out[0].randomId, true);
    delete out[0]._id;
    delete out[0].randomId;
    assert.deepEqual(out, expectedResult);
  });

  test('Big ownerArgs', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: 'client, method:*, sub:*',
          startTime: timestamp,
          subType: 'uncaught',
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              ownerArgs: [100, randomString(1200)],
              events: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', {foo: 'bar'}]
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = ['100', '--- argument size exceeds limit ---'];
    var out = errorTracesParser(postData);
    assert.deepEqual(out[0].stacks[0].ownerArgs, expectedResult);
  });

  test('Big event field', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: 'client, method:*, sub:*',
          startTime: timestamp,
          subType: 'uncaught',
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              events: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', {foo: 'bar'}, randomString(1200)]
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = '--- argument size exceeds limit ---';
    var out = errorTracesParser(postData);
    assert.deepEqual(out[0].stacks[0].events[0].args, expectedResult);
  });

  test('Big info field', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: 'client, method:*, sub:*',
          startTime: timestamp,
          subType: 'uncaught',
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              info: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', {foo: 'bar'}, randomString(1200)]
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = '--- argument size exceeds limit ---';
    var out = errorTracesParser(postData);
    assert.deepEqual(out[0].stacks[0].info[0].args, expectedResult);
  });

  test('Big type field', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var typeStr = randomString(1200);
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: 'This is the Error Name',
          type: typeStr,
          startTime: timestamp,
          subType: 'uncaught',
          info: {
            browser: 'Google Chrome',
            userId: 'Ah5njhYfJ7kUHTWKZ',
            url: 'http://localhost:6000',
            ip: '127.0.0.1',
          },
          stacks: [
            {
              at: timestamp,
              stack: '--- stack trace ---',
              info: [
                {
                  type: 'method',
                  name: 'some-method',
                  args: ['arg1', {foo: 'bar'}, '123']
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = typeStr.slice(0, 50);
    var out = errorTracesParser(postData);
    assert.deepEqual(out[0].type, expectedResult);
  });

  test('Object for error name', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var postData = {
      host: 'some-host',
      app: {plan: 'free'},
      errors: [
        {
          appId: 'dhdfsd6757sfs',
          name: {foo: 'bar'},
          type: 'client, method:*, sub:*',
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
            name: {foo: 'bar'},
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
                  args: [100, 'arg1', {foo: 'bar'}]
                }
              ]
            }
          ]
        }
      ]
    }
    var expectedResult = [
      {
        // _id: ???
        appId: 'dhdfsd6757sfs',
        host: 'some-host',
        name: '{"foo":"bar"}',
        type: 'client, method:*, sub:*',
        startTime: timestamp,
        // randomId: ???,
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
          name: {foo: 'bar'},
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
                args: "[100,\"arg1\",{\"foo\":\"bar\"}]"
              }
            ]
          }
        ],
        _expires: timestamp + 1000*60*60*24*2,
      }
    ];
    var out = errorTracesParser(postData);
    out[0].startTime = out[0].startTime.getTime();
    out[0]._expires = out[0]._expires.getTime();
    assert.equal(!!out[0]._id, true);
    assert.equal(!!out[0].randomId, true);
    delete out[0]._id;
    delete out[0].randomId;
    assert.deepEqual(out, expectedResult);
  });

});

function randomString(length) {
  if(length) {
    var l50 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-';
    var n50 = Math.floor(length / 50);
    var arr = [];

    for(var l = n50; l-->0;){
      arr[l] = l50;
    }

    for(var l = length - 50 * n50; l-->0;) {
      arr[n50 + l] = 'A';
    }

    return arr.join('');
  } else {
    return '';
  }
}
