var plans = [
  {
    id: "startup",
    name: "Startup",
    value: "startup",
    label: "StartUp Plan (5 Hosts, 2 Weeks History, $50/Month)"
  },
  {
    id: "pro",
    value: "pro",
    name: "Pro",
    label: "Pro Plan (15 Hosts, 3 Months History, $140/Month)"
  },
  {
    id: "business",
    value: "business",
    name: "Business",
    label: "Business Plan (45 Hosts, 3 Months History, $360/Month)"
  }
];

var localCheckoutHandlers = null;
var component = FlowComponents.define("app.setPlan", function(props) {
  this.autorun(function() {
    this.set("currentPricingType", props.currentPricingType || "free");
    var appPricingType = this.get("appPricingType");
    var isFreeUser = this.get("isFreeUser");
    if(appPricingType === "paid" && isFreeUser){
      $("#create-app-submit").attr("disabled", true);
    } else {
      $("#create-app-submit").attr("disabled", false);
    }
  });

  var self = this;
  this.stripe = StripeHelper.getStripe(Meteor.user());

  if(localCheckoutHandlers) {
    self.checkoutHandlers = localCheckoutHandlers;
  } else {
    self.checkoutHandlers = [];

    self.stripe.ready(function() {
      plans.forEach(function(plan) {
        self.checkoutHandlers[plan.id] = self.stripe.getCheckoutHandler({
          amount: 0,
          description: plan.name,
          panelLabel: "Subscribe",
          token: self.updatePlan(plan)
        });
      });
    });

    localCheckoutHandlers = this.checkoutHandlers;
  }

});

component.state.plans = function () {
  return plans;
};

component.state.isFreeUser = function() {
  var plan = Meteor.user() && Meteor.user().plan || "free";
  return plan === "free";
};

component.state.canShowUpgradeOptions = function() {
  var appPricingType = this.get("appPricingType");
  var isFreeUser = this.get("isFreeUser");
  return appPricingType === "paid" && isFreeUser;
};

component.state.currentPlan = function() {
  var plan = Meteor.user().plan || "free";
  return plan;
};

component.state.isCurrentPricingType = function(pricingType) {
  return this.get("currentPricingType") === pricingType;
};

component.action.showPaidPlan = function(appPricingType) {
  this.set("appPricingType", appPricingType);
};

component.action.upgradePlan = function() {
  var planName = this.get("selectedPlan") || plans[0].value;
  var planId = _.find(plans, planInfo => {
    return planInfo.value === planName;
  }).id;
  this.$("#upgrade-plan").button("loading");
  var user = Meteor.user();
  if(user && user.stripe && user.stripe.card) {
    Meteor.call("account.update.plan", planName, (err) => {
      if(err) {
        growlAlert.error(err.reason || err.message);
      } else {
        growlAlert.success("Plan successfully changed to "+ planName);
      }
      this.$("#upgrade-plan").button("reset");
    });
  } else {
    this.stripe.ready(() => {
      this.$("#upgrade-plan").button("reset");
      this.checkoutHandlers[planId].open();
    });
  }
};

component.action.setSelectedUserPlan = function (plan) {
  this.set("selectedPlan", plan);
};

component.prototype.updatePlan = function(plan) {
  var self = this;
  return function(cardInfo) {
    self.$("#upgrade-plan").button("loading");
    Meteor.call("account.update.card", cardInfo, plan.id, function(err) {
      if(err) {
        growlAlert.error(err.reason || err.message);
      } else {
        growlAlert.success("Plan successfully changed to "+ plan.id);
      }
      self.$("#upgrade-plan").button("reset");
    });
  };
};
