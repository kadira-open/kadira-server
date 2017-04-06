var TRACE_TYPES = {
  "method": "Method",
  "pub": "Publication",
  "sub": "Subscription",
  "server-crash": "Server Crash",
  "server-internal": "Internal Server Error"
};

var component =
FlowComponents.define("traceExplorer.server", function (params) {
  this.setFn("trace", params.traceFn);
});

component.extend(Mixins.UiHelpers);

component.action.goToWaitLink = function(waitInfo) {
  var routeName = FlowRouter.current().route.name;
  var trace = this.get("trace") || {};

  // if route name is 'debug'
  // then, disable link target
  // otherwise switch the route to relevent trace
  // ::
  if(routeName === "debug") {
    return false;
  }

  var WAIT_TYPES_TO_PARAM_NAME = {
    "method": "methods",
    "subscription": "pubsub",
  };
  var subSection = WAIT_TYPES_TO_PARAM_NAME[waitInfo.waitType];
  var date = FlowRouter.getQueryParam("date");
  
  var appId = trace.appId;
  var section = "dashboard";

  var fields = {
    appId: appId,
    section: section,
    subSection: subSection
  };

  var currentQueryParams = FlowRouter.current().queryParams;
  var queryParams = _.omit(currentQueryParams, "explore", "pub");
  queryParams.selection = waitInfo.name;
  queryParams.date = date;

  var path = FlowRouter.path("app", fields, queryParams);
  FlowRouter.go(path);
};

component.state.isError = function() {
  var trace = this.get("trace");
  return trace && trace.trace && trace.trace.errored;
};

component.state.usingOldKadiraVerion = function(type, isEventsProcessed){
  var OLD_TRACE_TYPES = {
    "unsub": true
  };
  if(OLD_TRACE_TYPES[type] && !isEventsProcessed){
    return true;
  } else {
    return false;
  }
};

component.state.traceTypes = function() {
  return TRACE_TYPES;
};

component.state.eventsArray = function() {
  var trace = this.get("trace");
  var startTime = new Date(trace.startTime);
  var eventsArray;
  if(this.get("isError")){
    eventsArray = trace.trace.events || [];
  } else {
    eventsArray = trace.events || [];
  }
  if(eventsArray.length > 1){
    eventsArray[0][2] = eventsArray[0][2] || {};
    eventsArray[0][2].userId = eventsArray[0][2].userId || "null";
    eventsArray[0][3] = startTime;
    var arrayLastElement = eventsArray.length - 1;
    eventsArray[arrayLastElement][3] = eventsArray[arrayLastElement][3] || {};
    eventsArray[arrayLastElement][3].totalValue = trace.totalValue;
    trace.totalValue = trace.totalValue || 0;
    var endTime = new Date(startTime.getTime() +trace.totalValue);
    eventsArray[eventsArray.length-1][3].endTime = endTime;
  }
  return eventsArray;
};

component.state.isOplogDisabled = function(dbEventInfo) {
  return dbEventInfo.oplog === null || dbEventInfo.oplog === false;
};

component.state.waitInfo = function(waitOn) {
  waitOn.value = waitOn.value || {};
  var key = waitOn.value.msg;
  var WAIT_TYPES = {
    "method": "method",
    "sub": "subscription",
    "unsub": "unsubscription"
  };
  var result = {
    waitType: WAIT_TYPES[key] || key,
    name: waitOn.value.name || waitOn.value.method,
  };

  if(waitOn.value.waitTime >= 0) {
    result.waitTime = waitOn.value.waitTime + " ms";
  }

  if(key !== "unsub"){
    result.link = true;
  }
  return result;
};

component.state.waitCounts = function(events) {
  var waitOnArray = events[2].waitOn;
  var counts = _.countBy(waitOnArray, function(item) {
    return item.msg;
  });
  return counts;
};

component.state.oplogDisplayValue = function(context) {
  var OPLOG_PROPERTY_BLACKLIST = {
    noOplogCode: true,
    noOplogReason: true,
    noOplogSolution: true
  };

  if(!OPLOG_PROPERTY_BLACKLIST[context.key]){
    return "" + context.value;
  } else if(context.key === "oplog"){
    return context.value || false;
  }

  return false;
};

component.extend(Mixins.UiHelpers);