var component = FlowComponents.define("trace_explorer.header", function(props) {
  this.setFn("isError", props.isErrorFn);
  this.setFn("trace", props.traceFn);
  this.set("traceTypes", props.traceTypes);
});

component.state.name = function() {
  var trace = this.get("trace") || {};
  var traceType = trace.type;
  var traceTypes = this.get("traceTypes");
  if(traceTypes[traceType]){
    traceType = traceTypes[traceType];
  }
  var isError = this.get("isError");
  var errorName = "";
  if(isError) {
    errorName = trace.trace.name;
  } else {
    errorName = trace.name;
  }
  return traceType+ " - "+ errorName;
};

component.state.title = function() {
  var trace = this.get("trace");
  var events = trace.events;
  var eventsLastElement = events.length - 1;
  var title = events &&
    events[eventsLastElement] &&
    events[eventsLastElement][2] &&
    events[eventsLastElement][2].error &&
    events[eventsLastElement][2].error.message;
  return title;
};

component.state.hostName = function () {
  var trace = this.get("trace") || {};
  var host = trace.host;
  return host && `Host - ${host}`;
};

component.state.startTime = function() {
  var trace = this.get("trace") || {};
  return trace.startTime;
};

component.extend(Mixins.UiHelpers);
