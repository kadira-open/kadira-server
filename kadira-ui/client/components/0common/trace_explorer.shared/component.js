var DATA_KEY_TO_TRACE_TYPE_PATH = {
  pt : "traces.pubsubSingle",
  mt: "traces.methodsSingle",
  et: "traces.errorsSingle"
};

var PATH_TO_TRACE_TYPE = {
  pt: "pub",
  mt: "method",
  et: "errors"
};

var component = FlowComponents.define("traceExplorer.shared", function() {
  this.autorun(function() {
    var traceId = FlowRouter.getParam("traceId");
    // Here appId is required for sharding
    var appId = FlowRouter.getParam("appId");

    var pathSegments = FlowRouter.current().path.split("/", 2);
    var typeId = pathSegments[1];
    var args = {query: {_id: traceId}, appId: appId};
    var dataKey = DATA_KEY_TO_TRACE_TYPE_PATH[typeId];
    if(dataKey) {
      this.kdFindTraces("trace", dataKey, args);
    }

    var type = PATH_TO_TRACE_TYPE[typeId];
    this.set("type", type);
  });
});

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


component.extend(KadiraData.FlowMixin);