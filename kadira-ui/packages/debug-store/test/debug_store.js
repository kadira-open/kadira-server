Tinytest.addAsync(
'DebugStore - _normalizeDateToSec',
function(test, done) {
  var ds = new DebugStore();
  var nTime = ds._normalizeDateToSec(2323900);
  test.equal(nTime, 2323000);
  done();
});

Tinytest.addAsync(
'DebugStore - _getSessionId',
function(test, done) {
  var ds = new DebugStore();
  var name = ds._getSessionId('chrome', 'one');
  test.equal(name, 'chrome - one');
  done();
});

Tinytest.addAsync(
'DebugStore - _getSession - not existing',
function(test, done) {
  var ds = new DebugStore();
  var name = 'one';
  var session = ds._getSession(name);
  test.isTrue(ds._sessions[name] === session);
  done();
});

Tinytest.addAsync(
'DebugStore - _getSession - existing',
function(test, done) {
  var ds = new DebugStore();
  var name = 'one';
  var session = ds._getSession(name);
  var session2 = ds._getSession(name);
  test.isTrue(session === session2);
  done();
});

Tinytest.addAsync(
'DebugStore - getSessions - nonreactive',
function(test, done) {
  var ds = new DebugStore();
  var name = 'one';
  var session = ds._getSession(name);
  var sessions = ds.getSessions();
  test.equal(sessions, [name]);
  done();
});

Tinytest.addAsync(
'DebugStore - getSessions - reactively',
function(test, done) {
  var ds = new DebugStore();
  var name = 'one';
  Tracker.autorun(function(c) {
    var sessions = ds.getSessions();
    if(sessions.length > 0) {
      test.equal(sessions, [name]);
      c.stop();
      done();
    }
  });

  var session = ds._getSession(name);
});

Tinytest.addAsync(
'DebugStore - getSessions - reactively after reset',
function(test, done) {
  var ds = new DebugStore();
  var name = 'one';
  var session = ds._getSession(name);

  Tracker.autorun(function(c) {
    var sessions = ds.getSessions();
    if(sessions.length === 0) {
      c.stop();
      Meteor.defer(done);
    }
  });

  ds.reset();
});

Tinytest.addAsync(
'DebugStore - _getLastTimestamp - event is older',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var session = ds._getSession(ds._getSessionId(browser, client));

  ds.addItem(browser, client, {timestamp: 1008, activities: [{}]})
  ds.addItem(browser, client, {timestamp: 2008, events: [[]]});
  ds.addItem(browser, client, {timestamp: 3008, events: [[]]});

  var lastTimestamp = ds._getLastTimestamp(session);
  test.equal(lastTimestamp, 3000);
  done();
});

Tinytest.addAsync(
'DebugStore - _getLastTimestamp - activity is older',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var session = ds._getSession(ds._getSessionId(browser, client));

  ds.addItem(browser, client, {timestamp: 2008, activities: [{}]});
  ds.addItem(browser, client, {timestamp: 3008, events: [[]]});
  ds.addItem(browser, client, {timestamp: 4008, activities: [{}]})

  var lastTimestamp = ds._getLastTimestamp(session);
  test.equal(lastTimestamp, 4000);
  done();
});

Tinytest.addAsync(
'DebugStore - _getLastTimestamp - no data',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var session = ds._getSession(ds._getSessionId(browser, client));

  var lastTimestamp = ds._getLastTimestamp(session);
  test.equal(lastTimestamp, 0);
  done();
});

Tinytest.addAsync(
'DebugStore - addItem ',
function(test, done) {
  var ds = new DebugStore();
  var browser = 'chrome';
  var client = 'c1';

  var data = {
    serverId: 'svrId',
    timestamp: 1008,
    events: [[1010, 'type', {aa: 10}]],
    activities: [{type: 'type', name: 'n'}],
    times: [
      {
        event: 'start',
        id: 'tid',
        info: {
          name: "event.name"
        },
        timestamp: new Date(),
        type: 'pubsub'
      }
    ]
  };

  ds.addItem(browser, client, data);

  var session = ds._getSession(ds._getSessionId(browser, client));

  // verify activities
  var activities = session.activities.pickIn('type').fetch();
  var activity = data.activities[0];
  activity.baseTimestamp = 1000;
  test.equal(_.omit(activities[0], '_id'), activity);

  // verify events
  var events = session.events.pickIn('type').fetch();
  var event = {
    baseTimestamp: 1000,
    timestamp: data.events[0][0],
    type: data.events[0][1],
    info: data.events[0][2]
  };
  test.equal(_.omit(events[0], '_id'), event);

  // verify times
  test.equal(session._serverId, 'svrId');
  test.length(session.timestore._itemList, 1);
  test.equal(session.timestore._itemList[0].key, 'pubsub-tid');
  test.equal(session.timestore._itemList[0].type, 'pubsub');
  test.equal(session.timestore._itemList[0].info.name, 'event.name');
  
  done();
});

Tinytest.addAsync(
'DebugStore - pause / resume',
function(test, done) {
  var ds = new DebugStore();
  var browser = 'chrome2';
  var client = 'c2';

  var data = {
    timestamp: 1009,
    events: [[1011, 'type', {axa: 20}]],
    activities: [{type: 'testtype', name: 'nm'}]
  };

  var session = ds._getSession(ds._getSessionId(browser, client));
  var activities = session.activities.pickIn('type').fetch();
  test.equal([],activities);

  ds.addItem(browser, client, data);
  activities = session.activities.pickIn('type').fetch();
  test.length(activities, 1);

  // pause
  test.equal([],ds.addItemQueue);
  test.equal(ds.liveUpdate, true);
  ds.pause();
  test.equal(ds.liveUpdate, false);
  ds.addItem(browser, client, data);
  ds.addItem(browser, client, data);
  test.length(ds.addItemQueue, 2);
  activities = session.activities.pickIn('type').fetch();
  test.length(activities, 1);

  // resume
  ds.resume();
  test.equal([],ds.addItemQueue);
  activities = session.activities.pickIn('type').fetch();
  test.length(activities, 3);
  test.equal(ds.liveUpdate, true);

  done();
});

Tinytest.addAsync(
'DebugStore - getEvents - no such session',
function(test, done) {
  var ds = new DebugStore();
  var response = ds.getEvents("s3rsefd");
  test.equal(response, false);
  done();
});

Tinytest.addAsync(
'DebugStore - getEvents - have data',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 1008, events: [[1010, 't', {aa: 10}]]});
  ds.addItem(browser, client, {timestamp: 2008, events: [[2010, 't1', {aa: 10}]]});

  var response = ds.getEvents(sessionId).fetch();
  test.equal(response.length, 2);
  done();
});

Tinytest.addAsync(
'DebugStore - getEvents - have data - with querying',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 1008, events: [[1010, 't', {aa: 10}]]});
  ds.addItem(browser, client, {timestamp: 2008, events: [[2010, 't1', {aa: 10}]]});

  var response = ds.getEvents(sessionId, {type: 't1'}).fetch();
  test.equal(response.length, 1);
  test.equal(response[0].type, 't1');
  done();
});

Tinytest.addAsync(
'DebugStore - aggregateActivities - no data',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  var response = ds.aggregateActivities(sessionId);
  test.equal(response, false);
  done();
});

Tinytest.addAsync(
'DebugStore - aggregateActivities - has no activities in the given range',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 2008, activities: []});

  var response = ds.aggregateActivities(sessionId, 1000, 2000);
  test.equal(response, {});
  done();
});

Tinytest.addAsync(
'DebugStore - aggregateActivities - has data',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 2008, activities: [
    {type: 't1', name: 'abc', elapsedTime: 10, count: 1},
    {type: 't1', name: 'bbc', elapsedTime: 10, count: 1}
  ]});

  ds.addItem(browser, client, {timestamp: 2010, activities: [
    {type: 't1', name: 'abc', elapsedTime: 20, count: 1},
    {type: 't2', name: 'abc', elapsedTime: 10, count: 1}
  ]});

  var options = {};
  var response = ds.aggregateActivities(sessionId, 1000, 2000, options);
  test.equal(response['t1'], {
    count: 3, 
    elapsedTime: 40,
    items: [
      {name: 'abc', count: 2, elapsedTime: 30},
      {name: 'bbc', count: 1, elapsedTime: 10},
    ]
  });

  test.equal(response['t2'], {
    count: 1, 
    elapsedTime: 10,
    items: [
      {name: 'abc', count: 1, elapsedTime: 10}
    ]
  });
  done();
});

Tinytest.addAsync(
'DebugStore - aggregateActivities - has data - sort by count',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 2008, activities: [
    {type: 't1', name: 'abc', elapsedTime: 10, count: 1},
    {type: 't1', name: 'bbc', elapsedTime: 10, count: 5}
  ]});

  ds.addItem(browser, client, {timestamp: 2010, activities: [
    {type: 't1', name: 'abc', elapsedTime: 20, count: 1},
    {type: 't2', name: 'abc', elapsedTime: 10, count: 1}
  ]});

  var options = {sortField: 'count'};
  var response = ds.aggregateActivities(sessionId, 1000, 2000, options);
  test.equal(response['t1'], {
    count: 7, 
    elapsedTime: 40,
    items: [
      {name: 'bbc', count: 5, elapsedTime: 10},
      {name: 'abc', count: 2, elapsedTime: 30},
    ]
  });

  test.equal(response['t2'], {
    count: 1, 
    elapsedTime: 10,
    items: [
      {name: 'abc', count: 1, elapsedTime: 10}
    ]
  });
  done();
});

Tinytest.addAsync(
'DebugStore - aggregateActivities - has data with noItems',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 2008, activities: [
    {type: 't1', name: 'abc', elapsedTime: 10, count: 1},
    {type: 't1', name: 'bbc', elapsedTime: 10, count: 1}
  ]});

  ds.addItem(browser, client, {timestamp: 2010, activities: [
    {type: 't1', name: 'abc', elapsedTime: 20, count: 1},
    {type: 't2', name: 'abc', elapsedTime: 10, count: 1}
  ]});

  var options = {noItems: true};
  var response = ds.aggregateActivities(sessionId, 1000, 2000, options);
  test.equal(response['t1'], {
    count: 3, 
    elapsedTime: 40
  });

  test.equal(response['t2'], {
    count: 1, 
    elapsedTime: 10
  });
  done();
});

Tinytest.addAsync(
'DebugStore - aggregateLastActivities - last one sec',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 2008, activities: [
    {type: 't1', name: 'abc', elapsedTime: 10, count: 1},
    {type: 't1', name: 'bbc', elapsedTime: 10, count: 1}
  ]});

  ds.addItem(browser, client, {timestamp: 2010, activities: [
    {type: 't1', name: 'abc', elapsedTime: 20, count: 1},
    {type: 't2', name: 'abc', elapsedTime: 10, count: 1}
  ]});

  var options = {noItems: true};
  var response = ds.aggregateLastActivities(sessionId, 1);
  test.equal(response['t1'], {
    count: 3, 
    elapsedTime: 40,
    items: [
      {name: 'abc', count: 2, elapsedTime: 30},
      {name: 'bbc', count: 1, elapsedTime: 10},
    ]
  });

  test.equal(response['t2'], {
    count: 1, 
    elapsedTime: 10,
    items: [
      {name: 'abc', count: 1, elapsedTime: 10}
    ]
  });
  done();
});


Tinytest.addAsync(
'DebugStore - getActivityTimeline - for 3 secs',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 10008, activities: [
    {type: 't1', name: 'abc', elapsedTime: 10, count: 1},
    {type: 't1', name: 'bbc', elapsedTime: 10, count: 1}
  ]});

  ds.addItem(browser, client, {timestamp: 10010, activities: [
    {type: 't1', name: 'abc', elapsedTime: 20, count: 1},
    {type: 't2', name: 'abc', elapsedTime: 10, count: 1}
  ]});

  var response = ds.getActivityTimeline(sessionId, 3);
  test.equal(response, [
    [8000, 0],
    [9000, 0],
    [10000, 50]
  ]);
  done();
});

Tinytest.addAsync(
'DebugStore - getDdpTimiline',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 10008, times: [
    {type: "method", id: "1", event: "start", timestamp: 100, info: {name: "m1"}},
    {type: "method", id: "2", event: "start", timestamp: 200, info: {name: "m2"}},
  ]});

  ds.addItem(browser, client, {timestamp: 10008, times: [
    {type: "method", id: "1", event: "end", timestamp: 300}
  ]});

  var timeline = ds.getDdpTimeline(sessionId);
  var items = timeline.getItemList();
  test.equal(items, [
    {key: "method-1", type: "method", startAt: 100, info: {name: "m1"}},
    {key: "method-2", type: "method", startAt: 200, info: {name: "m2"}},
  ]);

  var m1Timeline = timeline.getItemTimeline("method-1");
  test.equal(m1Timeline, [
    {event: "start", timestamp: 100},
    {event: "end", timestamp: 300}
  ]);
  done();
});

Tinytest.addAsync(
'DebugStore - getGuageTimeline - for 3 secs',
function(test, done) {
  var ds = new DebugStore();
  var browser = "b1";
  var client = "c1";
  var sessionId = ds._getSessionId(browser, client);

  ds.addItem(browser, client, {timestamp: 8009, gauges: {mem: 10, cpu: 20}});

  ds.addItem(browser, client, {timestamp: 10008, gauges:{mem: 10, cpu: 20}});

  ds.addItem(browser, client, {timestamp: 10010, gauges: {mem: 40, cpu: 20}});

  var memResponse = ds.getGuageTimeline('mem', sessionId, 3);
  test.equal(memResponse, [
    [8000, 10],
    [9000, 0],
    [10000, 25]
  ]);

  var cpuResponse = ds.getGuageTimeline('cpu', sessionId, 3);
  test.equal(cpuResponse, [
    [8000, 20],
    [9000, 0],
    [10000, 20]
  ]);
  done();
});

Tinytest.addAsync(
'DebugStore - dump/load DebugStore',
function(test, done) {
  var ds = new DebugStore();
  var browser = 'chrome';
  var client = 'c1';
  var sessionId = browser + ' - ' + client;

  var data = {
    serverId: 'svrId',
    timestamp: 1008,
    events: [[1010, 'type', {aa: 10}]],
    activities: [{type: 'type', name: 'n'}],
    times: [
      {
        event: 'start',
        id: 'tid',
        info: {
          name: "event.name"
        },
        timestamp: new Date(),
        type: 'pubsub'
      }
    ]
  };

  ds.addItem(browser, client, data);

  // mock the getTrace() method
  ds.getTrace = function(browserId, clientId, type, id, cb) {
    cb(false, true);
  };

  // dump
  ds.dump(sessionId).then(function(dumpedData) {
    test.equal(typeof dumpedData, "object");
    test.equal(dumpedData.hasOwnProperty("events"), true);
    test.equal(dumpedData.hasOwnProperty("activities"), true);
    test.equal(dumpedData.hasOwnProperty("gauges"), true);
    test.equal(dumpedData.hasOwnProperty("timestore"), true);
    test.equal(dumpedData.hasOwnProperty("traces"), true);

    test.equal(dumpedData.events.length, 1);
    test.equal(dumpedData.activities.length, 1);
    test.equal(dumpedData.timestore.itemList.length, 1);
    
    ds.reset();

    // load
    ds.load(sessionId, dumpedData);
    var session = ds._getSession(ds._getSessionId(browser, client));
    
    // verify activities
    var activities = session.activities.pickIn('type').fetch();
    var activity = data.activities[0];
    activity.baseTimestamp = 1000;
    test.equal(_.omit(activities[0], '_id'), activity);

    // verify events
    var events = session.events.pickIn('type').fetch();
    var event = {
      baseTimestamp: 1000,
      timestamp: data.events[0][0],
      type: data.events[0][1],
      info: data.events[0][2]
    };
    test.equal(_.omit(events[0], '_id'), event);

    // verify times
    test.length(session.timestore._itemList, 1);
    test.equal(session.timestore._itemList[0].key, 'pubsub-tid');
    test.equal(session.timestore._itemList[0].type, 'pubsub');
    test.equal(session.timestore._itemList[0].info.name, 'event.name');

    done();
  });
});
