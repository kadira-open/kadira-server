Tinytest.addAsync(
'TimeStore - put ItemEvents and get it',
function(test, done) {
  var t = new TimeStore();
  var t1 = 100;
  var t2 = 200;
  
  Tracker.autorun(function(c) {
    var items = t.getItemList();
    if(!c.firstRun) {
      var expectedItems = [
        {key: "method-2", type: "method", startAt: 200, info: {name: "m2"}},
        {key: "method-1", type: "method", startAt: 100, info: {name: "m1"}}
      ];
      test.equal(items, expectedItems);
      c.stop();
      setTimeout(done);
    }
  });

  t.putItemEvent({type: 'method', id: '2', event: 'start', timestamp: t2, info: {name: 'm2'}});
  t.putItemEvent({type: 'method', id: '1', event: 'start', timestamp: t1, info: {name: 'm1'}});
});

Tinytest.addAsync(
'TimeStore - put ItemEvent of an existing item and get it',
function(test, done) {
  var t = new TimeStore();
  var t1 = 100;
  var t2 = 200;

  t.putItemEvent({type: 'method', id: '1', event: 'start', timestamp: t1, info: {name: 'm1'}});

  var c = Tracker.autorun(function(c) {
    var items = t.getItemList();
    if(!c.firstRun) {
      test.fail("Should not reactivelty change here");
    }
  });

  t.putItemEvent({type: 'method', id: '1', event: 'end', timestamp: t2});
  setTimeout(function() {
    c.stop();
    setTimeout(done);
  }, 200);
});

Tinytest.addAsync(
'TimeStore - put ItemEvent and get it from the timeline',
function(test, done) {
  var t = new TimeStore();
  var t1 = 100;
  var t2 = 200;

  t.putItemEvent({type: 'method', id: '1', event: 'start', timestamp: t1, info: {name: 'm1'}});

  Tracker.autorun(function(c) {
    var timeline = t.getItemTimeline('method-1');
    if(c.firstRun) {
      test.equal(timeline, [{event: 'start', timestamp: 100}]);      
    } else {
      test.equal(timeline, [
        {event: 'start', timestamp: 100},
        {event: 'end', timestamp: 200},
      ]);
      c.stop();
      setTimeout(done);
    }
  });

  t.putItemEvent({type: 'method', id: '1', event: 'end', timestamp: t2});
});

Tinytest.addAsync(
'TimeStore - put ItemEvent and get it from the timeline with sorted',
function(test, done) {
  var t = new TimeStore();
  var t1 = 100;
  var t2 = 200;

  t.putItemEvent({type: 'method', id: '1', event: 'end', timestamp: t2});

  Tracker.autorun(function(c) {
    var timeline = t.getItemTimeline('method-1');
    if(c.firstRun) {
      test.equal(timeline, [{event: 'end', timestamp: 200}]);      
    } else {
      test.equal(timeline, [
        {event: 'start', timestamp: 100},
        {event: 'end', timestamp: 200},
      ]);
      c.stop();
      setTimeout(done);
    }
  });

  t.putItemEvent({type: 'method', id: '1', event: 'start', timestamp: t1, info: {name: 'm1'}});  
});

Tinytest.addAsync(
'TimeStore - dump the timestore',
function(test, done) {
  var t = new TimeStore();
  var t1 = 100;
  var t2 = 200;

  t.putItemEvent({type: 'method', id: '1', event: 'end', timestamp: t1});
  t.putItemEvent({type: 'pubsub', id: '2', event: 'userData', timestamp: t2});

  var dumpData = t.dump();

  test.equal(typeof dumpData, "object");
  test.equal(dumpData.hasOwnProperty("itemList"), true);
  test.equal(dumpData.itemList.length, 2);
  test.equal(dumpData.itemList[0].key, "method-1");
  test.equal(dumpData.itemList[1].key, "pubsub-2");
  test.equal(dumpData.itemList[0].timeline[0].event, "end");
  test.equal(dumpData.itemList[1].timeline[0].event, "userData");
  done();
});

Tinytest.addAsync(
'TimeStore - load timestore data',
function(test, done) {
  var t = new TimeStore();
  var data = {
    itemList: [
      {
        key: "method-1",
        dep: {
          _dependentsById: {}
        },
        timeline:[
          {
            event: "end",
            timestamp: 100
          }
        ],
        sorted: false,
        type: "method",
        info: {}
      }
    ]
  };

  t.load(data);

  Tracker.autorun(function(c) {
    var timeline = t.getItemTimeline('method-1');
    if(c.firstRun) {
      test.equal(timeline, [{event: 'end', timestamp: 100}]);      
    } else {
      test.equal(timeline, [
        {event: 'start', timestamp: 100},
        {event: 'end', timestamp: 200},
      ]);
      c.stop();
      setTimeout(done);
    }
  });

  done();
});
