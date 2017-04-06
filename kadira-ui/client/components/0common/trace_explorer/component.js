var component = FlowComponents.define("traceExplorer", function(params) {
  var disableSharing = params.disableSharing || false;

  this.autorun(function() {
    var trace = params.traceFn();
    if(trace && trace.stacks && typeof trace.stacks === "string"){
      trace.stacks = JSON.parse(trace.stacks);
    }
    this.set("trace", trace);
  });

  this.set("enableSharing", !disableSharing);
  this.setFn("isLoading", params.isLoadingFn);
  this.setFn("type", params.typeFn);
});

component.state.isClient = function() {
  var trace = this.get("trace");
  return trace && trace.type === "client";
};

component.state.shareLink = function() {
  var TRACE_TYPE_TO_PATH = {
    "pub": "pt",
    "method": "mt",
    "errors": "et"
  };
  var type = this.get("type");
  var trace = this.get("trace");
  if(trace) {
    var linkPath = TRACE_TYPE_TO_PATH[type];
    var path = FlowRouter.path(":type/:traceId/:appId", {
      type: linkPath,
      traceId: trace._id,
      appId: FlowRouter.getParam("appId")
    });
    var url = Meteor.absoluteUrl(path, {secure: true});
    return url;
  }
};