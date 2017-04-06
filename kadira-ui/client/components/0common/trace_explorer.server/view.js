Template["traceExplorer.server"].helpers({
  templateName: function () {
    return "method_exp_server_" + this[0];
  }
});

Template["traceExplorer.server"].events({
  "click .wait-link": function(e) {
    e.preventDefault();
    FlowComponents.callAction("goToWaitLink", this);
  }
});
