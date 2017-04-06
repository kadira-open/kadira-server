Template.profilerDenied.events({
  "click .feature-preview .upgrade": function (e) {
    e.preventDefault();
    FlowComponents.callAction("upgradePlan");
  }
});