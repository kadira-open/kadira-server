Template["timeseries.hosts"].events({
  "click button.chart-host-switch": function() {
    FlowComponents.callAction("toggleHosts");
  },
  "click button.chart-go-full-screen": function() {
    FlowComponents.callAction("setFullScreenStatus", true);
  },
  "click button.chart-exit-full-screen": function() {
    FlowComponents.callAction("setFullScreenStatus", false);
  }
});
