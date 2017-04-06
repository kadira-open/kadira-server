Template.forgotPassword.events({
  "submit #forgotPassword": function(e) {
    e.preventDefault();
    FlowComponents.callAction("forgotPassword");
  }
});