Template["app.errors.trace"].events({
  "click .show-trace-explorer": function (e) {
    FlowComponents.callAction("goToTraceExplorer", this.id);
    e.preventDefault();
  },
  "click #error-manager-traces-tabs li": function(e) {
    var tab = $(e.target).attr("data-tab");
    FlowComponents.callAction("goToTab", tab);
    e.preventDefault();
  },
  "click #em-load-new-traces a": function(e) {
    FlowComponents.callAction("loadNewSampleTrace");
    e.preventDefault();
  }
});