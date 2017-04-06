Mixins.traceExplorer = {};
Mixins.traceExplorer.action = {};

Mixins.traceExplorer.action.goToTraceExplorer = function(id) {
  var traceType = this.get("traceType");
  FlowRouter.setQueryParams({type: traceType, explore: id});
};