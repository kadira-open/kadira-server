Template["account.profile"].events({
  "click #pr-connect-meteor-dev": function(e) {
    e.preventDefault();
    FlowComponents.callAction("reconnectMeteorDevAccount");
  }
});