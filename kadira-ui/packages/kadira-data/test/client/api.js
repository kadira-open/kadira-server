Apps = new Mongo.Collection('apps');

Tinytest.addAsync(
  'Client - observeMetrics - login',
  function(test, done) {
    var username = Random.id();
    var userId = Meteor.loginWithPassword('root', 'toor');
    Tracker.autorun(function(c) {
      var user = Meteor.user();
      if(user) {
        c.stop();
        done();
      }
    });
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - observe data fetch data',
  function(test, done) {
    var args = {realtime: true, appId: 'appId', range: 60 * 60 * 1000};
    var handle = KadiraData.observeMetrics('browser-metrics', args, {
      onStop: function(err) {
        if(err) {
          throw err;
        }
      }
    });

    Tracker.autorun(function(c) {
      var data = handle.fetch();
      if(data) {
        test.equal(data, [{_id: 'one', aa: 10}]);
        c.stop();
        handle.stop();
        done();
      }
    });
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - observe data caching for realtime queries',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, realtime: true, appId: 'appId'};
    var handle = KadiraData.observeMetrics('browser-metrics', args);

    var startAgain = _.once(_startAgain);
    Tracker.autorun(function(c) {
      var data = handle.fetch();
      if(data) {
        test.equal(data, [{_id: 'one', aa: 10}]);
        startAgain();
        handle.stop();
      }
    });

    function _startAgain() {
      var handle2 = KadiraData.observeMetrics('browser-metrics', args);
      var payloadList = [];
      var timeOut;
      Tracker.autorun(function(c) {
        var data = handle2.fetch();
        var ready = handle2.ready();
        payloadList.push({data: data, ready: ready});
        if(!timeOut) {
          // we get the data twice 
          // one from the cache and other from the server
          timeOut = setTimeout(function() {
            test.equal(payloadList, [
              {data: data, ready: true},
              {data: data, ready: true}
            ]);
            c.stop();
            handle2.stop();
            done();
          }, 100);
        }

      });
    }
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - observe data caching for non-realtime queries',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, appId: 'appId', time: new Date()};
    var handle = KadiraData.observeMetrics('browser-metrics', args);

    var startAgain = _.once(_startAgain);
    Tracker.autorun(function(c) {
      var data = handle.fetch();
      if(data) {
        test.equal(data, [{_id: 'one', aa: 10}]);
        startAgain();
        handle.stop();
      }
    });

    function _startAgain() {
      var handle2 = KadiraData.observeMetrics('browser-metrics', args);
      var payloadList = [];
      var timeOut;
      Tracker.autorun(function(c) {
        var data = handle2.fetch();
        var ready = handle2.ready();
        payloadList.push({data: data, ready: ready});
        if(!timeOut) {
          // we get the data only once
          timeOut = setTimeout(function() {
            test.equal(payloadList, [
              {data: data, ready: true}
            ]);
            c.stop();
            handle2.stop();
            done();
          }, 100);
        }

      });
    }
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - ready state',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, realtime: true, appId: 'appId'};
    var handle = KadiraData.observeMetrics('browser-metrics', args);
    Tracker.autorun(function(c) {
      if(handle.ready()) {
        var data = handle.fetch();
        test.equal(data, [{_id: 'one', aa: 10}]);
        c.stop();
        handle.stop();
        done();
      }
    });
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - on Error',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, realtime: true, appId: 'appId'};
    var handle = KadiraData.observeMetrics('none-exisiting', args, {
      onStop: onStop
    });

    function onStop(err) {
      test.equal(err.error, '404');
      handle.stop();
      done();
    }
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - when subscription stopped by the server',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, realtime: false, time: new Date(), appId: 'appId'};
    var handle = KadiraData.observeMetrics('browser-metrics', args, {
      onReady: onReady,
      onStop: onStop
    });

    function onReady(){
      var data = handle.fetch();
      test.equal(data, [{_id: 'one', aa: 10}]);
    }

    function onStop(err) {
      test.isTrue(_.isEmpty(err));
      handle.stop();
      done();
    }
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - when subscription stopped by the client',
  function(test, done) {
    var stoppedViaClient = false;
    var args = {range: 60 * 60 * 1000, realtime: true, appId: 'appId'};
    var handle = KadiraData.observeMetrics('browser-metrics', args, {
      onReady: onReady,
      onStop: onStop
    });

    function onReady(){
      var data = handle.fetch();
      test.equal(data, [{_id: 'one', aa: 10}]);
      Meteor.setTimeout(function() {
        stoppedViaClient = true;
        handle.stop();
      }, 200);
    }

    function onStop(err) {
      test.isTrue(_.isEmpty(err));
      test.isTrue(stoppedViaClient);
      done();
    }
  }
);

Tinytest.addAsync(
  'Client - observeMetrics - fetch a clone of data',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, realtime: true, appId: 'appId'};
    var handle = KadiraData.observeMetrics('browser-metrics', args);
    Tracker.autorun(function(c) {
      var data = handle.fetch();
      if(data) {
        // remove data
        data.pop();
        var newData = handle.fetch();
        test.equal(newData, [{_id: 'one', aa: 10}]);
        c.stop();
        handle.stop();
        done();
      }
    });
  }
);

Tinytest.addAsync(
  'Client - fetchTraces - fetch traces successfully',
  function(test, done) {
    var args = {range: 60 * 60 * 1000, time: new Date(), appId: 'appId'};
    KadiraData.fetchTraces('browser-traces', args, function(err, result) {
      test.equal(result, [{_id: 'one', aa: 10}]);
      done();
    });
  }
);

Tinytest.addAsync(
  'Client - fetchTraces - fetch traces with non time related data caching',
  function(test, done) {
    var args = {query: {_id: "one"}};
    KadiraData.fetchTraces('browser-traces', args, function(err, result) {
      test.equal(result, [{_id: 'one', aa: 10}]);
      var start = Date.now();
      KadiraData.fetchTraces('browser-traces', args, function(err, res2) {
        test.equal(res2, [{_id: 'one', aa: 10}]);
        // we've 200ms delay when fetching from the server
        // if the resTime is below 200ms, we know we are caching 
        var diff = Date.now() - start;
        test.isTrue(diff < 200);
        done();
      });
    });
  }
);

Tinytest.addAsync(
  'Client - fetchTraces - fetch traces with time related data - not caching',
  function(test, done) {
    var args = {query: {_id: "one"}, time: new Date()};
    KadiraData.fetchTraces('browser-traces', args, function(err, result) {
      test.equal(result, [{_id: 'one', aa: 10}]);
      var start = Date.now();
      KadiraData.fetchTraces('browser-traces', args, function(err, res2) {
        test.equal(res2, [{_id: 'one', aa: 10}]);
        // we've 200ms delay when fetching from the server
        // if the resTime is hgher than 200ms, we know we are not caching 
        var diff = Date.now() - start;
        test.isTrue(diff >= 200);
        done();
      });
    });
  }
);

Tinytest.addAsync(
  'Client - fetchTraces - fetch traces with time related data - caching',
  function(test, done) {
    var fiveMinAgo = new Date(Date.now() - (1000 * 60 * 5) - 100);
    var args = {query: {_id: "one"}, time: fiveMinAgo};
    KadiraData.fetchTraces('browser-traces', args, function(err, result) {
      test.equal(result, [{_id: 'one', aa: 10}]);
      var start = Date.now();
      KadiraData.fetchTraces('browser-traces', args, function(err, res2) {
        test.equal(res2, [{_id: 'one', aa: 10}]);
        // we've 200ms delay when fetching from the server
        // if the resTime is below 200ms, we know we are caching 
        var diff = Date.now() - start;
        test.isTrue(diff < 200);
        done();
      });
    });
  }
);

Tinytest.addAsync(
  'Client - fetchTraces - fetch traces from the server errored',
  function(test, done) {
    var dataKey = 'none-exisiting-traces';
    var args = {range: 60 * 60 * 1000, time: new Date(), appId: 'appId'};
    KadiraData.fetchTraces(dataKey, args, function(err) {
      test.equal(err.error, '404');
      done();
    });
  }
);