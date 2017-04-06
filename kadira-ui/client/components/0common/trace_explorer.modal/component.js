var DATA_KEY_TO_TRACE_TYPE = {
  pub : "traces.pubsubSingle",
  method: "traces.methodsSingle",
  errors: "traces.errorsSingle"
};

var component = FlowComponents.define("traceExplorer.modal", function() {

  this.autorun(function() {
    var traceId = FlowRouter.getQueryParam("explore");
    var type = FlowRouter.getQueryParam("type");
    // We need to pass the appId because, that's needed for sharding
    var appId = FlowRouter.getParam("appId");
    var args = {query: {_id: traceId}, appId: appId};

    var dataKey = DATA_KEY_TO_TRACE_TYPE[type];
    if(dataKey && traceId) {
      this.kdFindTraces("trace", dataKey, args);
    }

    this.set("type", type);
  });
});

component.state.canShow = function() {
  return !!FlowRouter.getQueryParam("explore");
};

component.state.trace = function() {
  var handle = this.kdTraces("trace");
  if(handle.ready()) {
    this.set("isTraceLoading", false);
    var trace = handle.fetch() || [];
    return trace[0];
  } else {
    this.set("isTraceLoading", true);
    return false;
  }
};

component.state.dialogTitle = function() {
  var trace = this.get("trace");
  var title;
  if(trace){
    title = "Trace Explorer : " + trace.name;
    if(trace.totalValue){
      title += " (" + trace.totalValue + "ms)";
    }
  }
  return title || "Trace Explorer";
};

component.action.closeDialog = function() {
  FlowRouter.setQueryParams({explore: null, type: null});
};

component.extend(KadiraData.FlowMixin);