Mixins.upgradeNotifier = {};
Mixins.upgradeNotifier.action = {};

Mixins.upgradeNotifier.action.upgradePlan = function() {
  var user = Meteor.user();
  var plan = Utils.getPlanFromUser(user);
  // close current dialog
  FlowRouter.setQueryParams({action: null});

  if(plan === "free"){
    FlowRouter.go("/account/plans");
  } else {
    FlowRouter.setQueryParams({"action": "settings"});
  }
};
