var plans = [
  {
    id: "free",
    name: "Free",
    description: "Free Plan (Free Forever)",
    minHostCount: "N/A",
    retention: "24 Hours",
    basePrice: "Free",
    additionHostPrice: "N/A"
  },
  {
    id: "startup",
    name: "Startup",
    description: "StartUp Plan ($10/host/month)",
    minHostCount: "5",
    retention: "2 Weeks",
    basePrice: "$50/month",
    additionHostPrice: "$10/host/month"
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pro Plan ($9/host/month)",
    minHostCount: "15",
    retention: "3 Months",
    basePrice: "$150/month",
    additionHostPrice: "$10/host/month"
  },
  {
    id: "business",
    name: "Business",
    description: "Business Plan ($8/host/month)",
    minHostCount: "45",
    retention: "3 Months",
    basePrice: "$360/month",
    additionHostPrice: "$8/host/month"
  }
];

var localCheckoutHandlers = null;

var component = FlowComponents.define("account.plans", function() {
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
          description: plan.description,
          panelLabel: "Subscribe",
          token: self.updatePlan(plan)
        });
      });
    });

    localCheckoutHandlers = this.checkoutHandlers;
  }
});

component.state.plans = function() {
  var self = this;
  var newPlans = _.filter(plans, function(plan) {
    // we only need to solo, if it's currently used by a user
    if(plan.id === "solo" && !self.isCurrentPlan(plan.id)) {
      return false;
    }

    return true;
  });
  return newPlans;
};

component.state.showLoadingIcon = function(planId) {
  var updatingPlan = this.get("updatingPlan");
  return updatingPlan === planId;
};

component.state.isCurrentPlan = function(plan) {
  return this.isCurrentPlan(plan);
};

component.action.selectPlan = function(plan) {
  self = this;
  self.set("selectPlan", plan);

  var user = Meteor.user();
  if(user && user.stripe && user.stripe.card) {
    self.set("updatingPlan", plan);

    Meteor.call("account.update.plan", plan, function(err) {
      if(err) {
        growlAlert.error(err.reason || err.message);
      } else {
        growlAlert.success("Plan successfully changed to "+ plan);
      }
      self.set("updatingPlan", null);
    });
  } else {
    self.stripe.ready(function() {
      self.checkoutHandlers[plan].open();
    });
  }
};

component.prototype.isCurrentPlan = function(plan) {
  var user = Meteor.user() || {};
  var currentPlan = user.plan;
  if(currentPlan === undefined) {
    currentPlan = "free";
  }

  return currentPlan && currentPlan === plan;
};

component.prototype.updatePlan = function(plan) {
  var self = this;

  return function(cardInfo) {
    self.set("updatingPlan", plan.id);
    Meteor.call("account.update.card", cardInfo, plan.id, function(err) {
      if(err) {
        growlAlert.error(err.reason || err.message);
      } else {
        growlAlert.success("Plan successfully changed to "+ plan.id);
      }
      self.set("updatingPlan", null);
    });
  };
};
