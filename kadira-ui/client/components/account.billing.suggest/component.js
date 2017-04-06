var component = FlowComponents.define("account.billing.suggest", function () {
  this.onRendered(function() {
    var userId = FlowRouter.getQueryParam("userId") || Meteor.userId();
    Meteor.call("account.suggestPlan", userId,(err, result) => {
      this.set("suggestedPlan", result);
    });
  })
});

component.state.isCustomPlanSuggested = function() {
  var suggestedPlan = this.get("suggestedPlan");
  return suggestedPlan === "custom";
};