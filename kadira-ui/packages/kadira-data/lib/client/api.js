KadiraData._coll = new Mongo.Collection('kadira-data-collection');
KadiraData._metricsCache = new LRU({max: 1000});
KadiraData._traceCache = new LRU({max: 1000});

KadiraData.fetchTraces = function(dataKey, args, callback) {
  var hash = KadiraData._generateHash(dataKey, args);
  var allowToGetFromCache = 
    // if there is no time, it's okay to get from the cache
    !args.time ||
    // older than 5 minutes. It's possible to change recent data
    // so, we should not rely on the cache
    (Date.now() - args.time.getTime()) > 1000 * 60 * 5;


  if(allowToGetFromCache && KadiraData._traceCache.peek(hash)) {
    var traces = KadiraData._traceCache.get(hash);
    // it's possible to alter the content inside traces
    // so, it should not affect others
    traces = EJSON.clone(traces);
    callback(null, traces);
    return;
  }

  Meteor.call('kadiraData.fetchTraces', dataKey, args, function(err, traces) {
    if(err) {
      callback(err);
    } else {
      KadiraData._traceCache.set(hash, traces);
      traces = EJSON.clone(traces);
      callback(null, traces);
    }
  });
};

KadiraData.observeMetrics = function observeMetrics(dataKey, args, callbacks) {
  callbacks = callbacks || {};
  callbacks.onStop = callbacks.onStop || function() {};
  callbacks.onReady = callbacks.onReady || function() {};
  var id = Random.id();
  var hash = KadiraData._generateHash(dataKey, args);
  var readyState = new ReactiveVar(false);
  var dataVariable = new ReactiveVar(null);

  // send the data in the cache
  if(KadiraData._metricsCache.peek(hash)) {
    var data = KadiraData._metricsCache.get(hash);

    // We need to run callback after we've returned the handler.
    // Otherwise, user will have to face issues since his handler is undefined
    // Meteor.defer fixes it
    Meteor.defer(function() {
      callbacks.onReady();
    });
  
    if(args.realtime) {
      // this is realtime query, we need to set the data immediately and 
      // let the query DB.
      dataVariable.set(data);
      readyState.set(true);
    } else {
      // if this is not realtime query, we don't need to query data
      var handle = {
        ready: function() {
          return true;
        }, 
        stop: function() {},
        fetch: function() {
          return EJSON.clone(data);
        }
      };
      return handle;
    }
  }

  var dataHandle = KadiraData._coll.find({_id: id}).observe({
    added: function(doc) {
      KadiraData._metricsCache.set(hash, doc.data);
      dataVariable.set(doc.data);
    }
  });

  var subName = 'kadiraData.observeMetrics';
  var subHandle = Meteor.subscribe(subName, id, dataKey, args, {
    onStop: function(err) {
      dataHandle.stop();
      callbacks.onStop(err);
    },
    onReady: function() {
      readyState.set(true);
      // if not realtime we dont need to watch for data changes
      if(!args.realtime){
        dataHandle.stop();
      }
      callbacks.onReady();
    }
  });

  return {
    ready: function() {
      return readyState.get();
    },
    stop: function() {
      dataHandle.stop();
      subHandle.stop();
    },
    fetch: function() {
      var data = EJSON.clone(dataVariable.get());
      return data;
    }
  };
};

KadiraData._generateHash = function _generateHash(dataKey, args) {
  var payload = {dataKey: dataKey, args: args};
  return JSON.stringify(payload);
};
