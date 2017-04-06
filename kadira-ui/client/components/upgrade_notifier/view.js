Template["upgradeNotifier"].events({
  "click .upgrade": function (e) {
    e.preventDefault();
    FlowComponents.callAction("upgradePlan");
  }
});
