Template["app.setPlan"].events({
  "change input[name=app-pricing-type]": function(e, tmpl) {
    e.preventDefault();
    var appPlanType = tmpl.$("input[name=app-pricing-type]:checked").val();
    FlowComponents.callAction("showPaidPlan", appPlanType);
  },
  "click #upgrade-plan": function (e) {
    e.preventDefault();
    FlowComponents.callAction("upgradePlan");
  }
});
