var component = FlowComponents.define("debug.root", function(props) {
  var debugStore = props.debugStoreFn();
  this.store = debugStore;

  this.currentUrl = props.currentUrl;
  this.set("currentUrl", this.currentUrl);
  this.set("offlineSession", props.offlineSession);

  this.autorun(function() {
    var currentSession = props.currentSessionFn();
    this.set("currentSession", currentSession);
  })

  this.set("navs", props.navigations);

  // set current activity time from query param
  FlowRouter.setQueryParams({startAt: null});
  
  this.autorun(function() {
    var startAt = FlowRouter.getQueryParam("startAt");
    this.set("currentActivityTime", startAt);
  });

  this.set("activitySort", "elapsedTime");
  
  this.autorun(this.setActivities);

  this.autorun(function() {
    var showEventInfo = FlowRouter.getQueryParam("info") || false;
    if(showEventInfo === "true") {
      this.set("showEventInfo", true);
    } else {
      this.set("showEventInfo", true);
    }
  });
});

component.prototype.getToggledSort = function() {
  var activitySort = this.get("activitySort");
  var toggledSort = (activitySort === "elapsedTime")? "count" : "elapsedTime";
  return toggledSort;
};

component.prototype.setActivities = function() {
  var currentSession = this.get("currentSession");
  if(!currentSession) {
    return;
  }

  var activitySort = this.get("activitySort");
  var activityTime = this.get("currentActivityTime");
  var activities;
  if(activityTime) {
    var startTime = activityTime - 1000;
    var endTime = startTime + 1000;
    var options = {sortField: activitySort};
    activities = this.store.aggregateActivities(
      currentSession, startTime, endTime, options
    );
  } else {
    activities = this.store.aggregateLastActivities(
      currentSession, 1, activitySort
    );
  }
  this.set("activities", activities);
};

component.prototype.showActivitiesAt = function(time) {
  var currentActivityTime = this.get(currentActivityTime);
  if(currentActivityTime === time) {
    time = null;
  }

  if(time) {
    this.store.pause();
  } else {
    this.store.resume();
  }
  
  this.set("currentActivityTime", time);
};

component.prototype.showTraceAt = function(e) {
  var currentTraceId = this.get("currentTraceId");
  if(currentTraceId === e._id) {
    this.set("currentTraceId", null);
    this.showActivitiesAt(null);
    return;
  } else {
    currentTraceId = e._id;
    this.set("currentTraceId", currentTraceId);
    this.showActivitiesAt(e.baseTimestamp);
  }

  var self = this;
  var hasTrace = null;
  var sampleMessages = [];
  this.set("sampleMessages", null);
  this.set("sampleTrace", null);
  
  var AVAILABLE_TRACES = {
    "ddp-sub" : "pubsub",
    "ddp-ready" : "pubsub",
    "ddp-unsub" : "pubsub",
    "ddp-nosub" : "pubsub",
    "ddp-method" : "method",
    "ddp-updated" :"method"
  };

  if(AVAILABLE_TRACES[e.type]) {
    hasTrace = true;
    var currentSession = this.get("currentSession");
    var clientInfo = this.store.getClientInfoFromSessionId(currentSession);

    var url = this.currentUrl;
    var browserId = clientInfo.browserId;
    var clientId = clientInfo.clientId;
    var id = getTraceTrackId(e);
    var type = AVAILABLE_TRACES[e.type];

    this.store.getTrace(browserId, clientId, type, id, 
      function(err, trace) {
        if(trace) {
          self.set("sampleTrace", trace);
          self.set("sampleTraceType", "pubsub");
        }
      }
    );
  } else {
    if(e.type === "live-updates") {
      _.each(e.info.sampleMessages, function(msg) {
        sampleMessages.push(JSON.stringify(msg, null, 2));
      });
      this.set("sampleMessages", sampleMessages);
    } else {
      sampleMessages.push(JSON.stringify(e.info, null, 2));
      this.set("sampleMessages", sampleMessages);      
    }
  }

  this.set("hasTrace", hasTrace);
};

function getTraceTrackId(e) {
  if(e.info.id) {
    return e.info.id;
  }

  if(e.info.subs) {
    return e.info.subs[0];
  }

  if(e.info.methods) {
    return e.info.methods[0];
  }
}