Template.connectionIndicator.events({
  "click #connection-indicator .retry": function (e) {
    e.preventDefault();
    FlowComponents.callAction("retry");
  }
});