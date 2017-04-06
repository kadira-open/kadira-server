var component = FlowComponents.define("account.billing.status", function() {

  this.autorun(function() {
    var appId = FlowRouter.getParam("appId");
    Meteor.call("account.isCloseToHitUsageLimit", appId, (error, result) => {
      this.set("isCloseToHitUsageLimit", !!result);
    });
  });
});

component.state.isOwner = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {owner: 1}}) || {};
  return app.owner === Meteor.userId();
};

component.action.goToUpgrade = function() {
  FlowRouter.go("/account/plans");
};
