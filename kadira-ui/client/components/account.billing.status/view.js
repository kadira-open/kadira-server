Template["account.billing.status"].events({
  "click #billing-warning .account-update": function(e) {
    e.preventDefault();
    FlowComponents.callAction("goToUpgrade");
  },

  "click #billing-warning .talk-to-us": function(e) {
    e.preventDefault();
    Intercom["public_api"].show();
  }
});