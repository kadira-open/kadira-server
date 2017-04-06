Template["apps.switcher"].events({
  "click .switch-app-link": function() {
    FlowComponents.callAction("switchTheApp", this);
  }
});