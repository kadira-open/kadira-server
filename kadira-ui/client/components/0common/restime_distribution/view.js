Template["restimeDistribution"].events({
  "click .trace-exp-btn": function (e) {
    e.preventDefault();
    FlowComponents.callAction("goToTraceExplorer", this._id);
  },
  "click .upgrade": function (e) {
    e.preventDefault();
    FlowComponents.callAction("upgradePlan");
  }
});
