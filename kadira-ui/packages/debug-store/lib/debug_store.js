// XXX: Currently we don't delete data once we get them, need to 
// implement some routines which deletes the data

DebugStore = function(options) {
  options = options || {};
  this.debugConn = options.debugConn || null;

  // in seconds
  options.maxDurationPerSession = options.maxDurationPerSession || 60;
  this._options = options;
  this._sessions = {};
  this.globalDep = new Tracker.Dependency();

  this.addItemQueue = [];
  this.liveUpdate = true;
  this._maxId = 0;

  this.traceCache = new LRU({max: 1000});

  this._serverId = null;
};

DebugStore.prototype.reset = function(session) {
  if(session) {
    this._sessions[session] = {};
  } else {
    this._sessions = {};
  }
  this.globalDep.changed();
};

DebugStore.prototype.pause = function() {
  this.liveUpdate = false;
};

DebugStore.prototype.resume = function() {
  var self = this;

  if(this.addItemQueue.length > 0) {
    _.each(this.addItemQueue, function(e) {
      self._addItem(e.browserId, e.clientId, e.data, true);
    });
    
    this.addItemQueue = [];
  }

  this.liveUpdate = true;
};

DebugStore.prototype.isLiveUpdateOn = function() {
  return this.liveUpdate;
};

DebugStore.prototype.getSessions = function() {
  this.globalDep.depend();
  return _.keys(this._sessions);
};

DebugStore.prototype.addItem = function(browserId, clientId, data) {
  if(!this.liveUpdate) {
    var item = {browserId: browserId, clientId: clientId, data: data};
    this.addItemQueue.push(item);
    return;
  }

  this._addItem(browserId, clientId, data);
};

DebugStore.prototype.getEvents = function(sessionId, selectedTypes, limit) {
  var session = this._sessions[sessionId];
  if(!session) {
    return false;
  }

  return session.events.pickIn('type', selectedTypes, limit);
};

DebugStore.prototype.aggregateActivities = 
function(sessionId, startTime, endTime, options) {
  var session = this._sessions[sessionId];
  if(!session) {
    return false;
  }

  var activities = session.activities.findRange('baseTimestamp', startTime, endTime);

  // it's possible these activities has duplicate activities
  // so, we need to merge them
  var mergedActivities = this._mergeActivities(activities);

  // organize activities in a way that they can be processed easily
  var finalTypes = {};
  _.each(mergedActivities, function(type, name) {
    var finalType = finalTypes[name] = {
      count: 0,
      elapsedTime: 0
    };

    var activities = _.values(type);

    if(activities.length > 0) {
      // first activity ('*') is special and it carries
      // the total for all the activties in a given type
      // we also don't wanna add it in the final result, that's we shift it.
      var firstTime = activities.shift();
      finalType.count = firstTime.count;
      finalType.elapsedTime = firstTime.elapsedTime;
    }

    // no need to sort and get individual activities
    if(options.noItems) {
      return;
    }

    finalType.items = activities;
    finalType.items.sort(function(a, b) {
      return b[options.sortField] - a[options.sortField];
    });
  });

  return finalTypes;
};

DebugStore.prototype._mergeActivities = function(activities) {
  var mergedActivities = {};
  _.each(activities, function(activity) {
    var type = mergedActivities[activity.type];
    if(!type) {
      type = mergedActivities[activity.type] = {};
      // we are maintaining a special activity name which has the counts for all 
      // the items in a given type
      type["*"] = {count: 0, elapsedTime: 0};
    }

    var totals = type["*"];
    var item = type[activity.name];
    if(!item) {
      item = type[activity.name] = {
        name: activity.name,
        count: 0,
        elapsedTime: 0
      };
    }

    item.count += activity.count;
    item.elapsedTime += activity.elapsedTime;
    totals.count += activity.count;
    totals.elapsedTime += activity.elapsedTime;
  });

  return mergedActivities;
};

DebugStore.prototype.aggregateLastActivities = 
function(sessionId, rangeInSecs, sortField) {
  sortField = sortField || "elapsedTime";
  var session = this._getSession(sessionId);
  var endTime = this._getLastTimestamp(session);

  if(endTime > 0) {
    var startTime = endTime - (1000 * rangeInSecs);
    var options = {sortField: sortField};
    return this.aggregateActivities(sessionId, startTime, endTime, options);
  }
};

DebugStore.prototype.getDdpTimeline = function(sessionId) {
  var session = this._getSession(sessionId);
  return session.timestore;
};

// get a timeline of activities which can be rendered into highcharts
DebugStore.prototype.getGuageTimeline = function(type, sessionId, lengthInSecs, endTime) {
  lengthInSecs = lengthInSecs || 120;
  var session = this._getSession(sessionId);
  var dataPoints = [];
  var totalMap = {};
  var countMap = {};

  var endTime = endTime || this._getLastTimestamp(session);
  endTime = this._normalizeDateToSec(endTime);
  var timeBeforeTwoMinutes = endTime - (1000 * lengthInSecs);

  var gauges = session.gauges
    .addFilter('type', type)
    .findRange('baseTimestamp', timeBeforeTwoMinutes, endTime, -1);

  // group elaspedTime basedOn baseTimestamp
  _.each(gauges, function(a) {
    if(!totalMap[a.baseTimestamp]) {
      totalMap[a.baseTimestamp] = 0;
      countMap[a.baseTimestamp] = 0;
    }

    totalMap[a.baseTimestamp] += a.value;
    countMap[a.baseTimestamp] ++;
  });

  // get data for the last 2 minutes
  for(var lc=lengthInSecs-1; lc >= 0; lc--) {
    var time = endTime - (1000 * lc);
    var total = totalMap[time] || 0;
    var count = countMap[time];

    var avg = (count)? total/count : 0;
    avg = parseFloat(avg.toFixed(2));

    dataPoints.push([time, avg]);
  }
  
  return dataPoints;
};

DebugStore.prototype.getTrace = function(browserId, clientId, type, id, cb) {
  if (this.debugConn) {
    var traceKey = type + "-" + id;

    if(this.traceCache.has(traceKey)) {
      var trace = this.traceCache.get(traceKey);
      if (cb) {
        cb(false, trace);
      }
    } else {
      if (this.debugConn.status().connected) {
        var self = this;

        this.debugConn.call("kadira.debug.remote.getTrace", browserId, clientId, type, id, 
          function(err, trace) {
            if (trace) {
              self.traceCache.set(traceKey, trace);
            }
            if (cb) {
              cb(err, trace);
            }
          }
        );
      }
    }
  }
};

DebugStore.prototype.dump = function(sessionId) {
  var self = this;
  var session = this._getSession(sessionId);

  // store traces
  var clientInfo = this.getClientInfoFromSessionId(sessionId);
  var traceKeys = (session && session.timestore && session.timestore._itemMap) ?
    Object.keys(session.timestore._itemMap) : [];

  var promises = traceKeys.map(function(key) {
    key = key.split("-");
    var type = key[0];
    var id = key[1];

    return new Promise(function(resolve, reject) {
      self.getTrace(clientInfo.browserId, clientInfo.clientId, type, id, function(err, trace) {
        if (err) {
          reject();
        }
        resolve();
      });
    });
  });

  // return dumped data
  return Promise.all(promises).then(function(res) {
    return {
      events: session.events.dump(),
      activities: session.activities.dump(),
      gauges: session.gauges.dump(),
      timestore: session.timestore.dump(),
      traces: self.traceCache.dump()
    };
  });
};

DebugStore.prototype.load = function(sessionId, data) {
  this.reset();
  
  var session = this._getSession(sessionId);
  session.events.load(data.events);
  session.activities.load(data.activities);
  session.gauges.load(data.gauges);
  session.timestore.load(data.timestore);

  if (data.traces) {
    // this.traceCache.load(data.traces);
    // XXX: LRU.load() method not working somehow
    // So, here adding trace one by one now
    this.traceCache.reset();
    var traces = data.traces;
    var self = this;
    _.each(traces, function(trace) {
      self.traceCache.set(trace.key, trace.value);
    });
  }

  this.globalDep.changed();
};

DebugStore.prototype._normalizeDateToSec = function(timestamp) {
  var diff = timestamp % 1000;
  return timestamp - diff;
};

DebugStore.prototype._getSessionId = function(browserId, clientId) {
  return browserId + " - " + clientId;
};

DebugStore.prototype.getClientInfoFromSessionId = function(sessionId) {
  sessionId = sessionId.split(" - ");
  
  return {
    browserId: sessionId[0],
    clientId : sessionId[1]
  };
}

DebugStore.prototype._getSession = function(sessionId) {
  if(!this._sessions[sessionId]) {
    this._sessions[sessionId] = {
      events: new Collection({maxItems: 20000}),
      activities: new Collection({maxItems: 20000}),
      gauges: new Collection({maxItems: 20000}),
      timestore: new TimeStore(),
      dep: new Tracker.Dependency(),
    };

    this.globalDep.changed();
  }

  return this._sessions[sessionId];
};

DebugStore.prototype._getLastTimestamp = function(session) {
  var lastActivity = session.activities.findLastItem();
  var lastEvent = session.events.findLastItem();
  var lastGauge = session.gauges.findLastItem();

  var endTime = (lastActivity)? lastActivity.baseTimestamp : 0;
  if(lastEvent && lastEvent.baseTimestamp > endTime) {
    endTime = lastEvent.baseTimestamp;
  }

  if(lastGauge && lastGauge.baseTimestamp > endTime) {
    endTime = lastGauge.baseTimestamp;
  }

  return endTime;
};

DebugStore.prototype._addItem = function(browserId, clientId, data, dontDepChange) {
  var self = this;
  var sessionId = this._getSessionId(browserId , clientId);
  var session = this._getSession(sessionId);
  var baseTimestamp = this._normalizeDateToSec(data.timestamp);

  // add events to minimongo event stream
  _.each(data.events, function(e) {
    var event = {
      // baseTimestamp is the current time for a given second
      baseTimestamp: e[3] || baseTimestamp,
      // actutal timestamp of the event with millis
      timestamp: e[0], 
      type: e[1],
      info: e[2],
      _id: self._maxId++
    };
    session.events.insert(event);
  });

  // add activities to minimongo activity strem
  _.each(data.activities, function(a) {
    a.baseTimestamp = a.baseTimestamp || baseTimestamp;
    session.activities.insert(a);
  });

  // add gauages
  _.each(data.gauges, function(value, key) {
    var gauge = {
      type: key,
      value: value
    };
    gauge.baseTimestamp = baseTimestamp;
    session.gauges.insert(gauge);
  });

  this._resetTimelineOnHCR(session, data);

  // add items to the timestore
  _.each(data.times, function(e) {
    session.timestore.putItemEvent(e);
  });
};

DebugStore.prototype._resetTimelineOnHCR = function(session, data) {
  // If serverId changes, we need to clear all the timestores in all sessions
  // If not, we've some issues in the timeline.
  if(!session._serverId) {
    session._serverId = data.serverId;
  }

  if(session._serverId !== data.serverId) {
    session._serverId = data.serverId;
    session.timestore.reset();
  }

  // if the clientcode changes, we need to reset the timeline as above
  if(!session._sessionKey) {
    session._sessionKey = data.sessionKey;
  }

  if(session._sessionKey !== data.sessionKey) {
    session._sessionKey = data.sessionKey;
    session.timestore.reset();
  }
};
