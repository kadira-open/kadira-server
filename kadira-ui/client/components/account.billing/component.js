/*jshint newcap: false */
import LoadScript from 'load-script'

var localCheckoutHandlers = null;

var component = FlowComponents.define("account.billing", function() {
  var self = this;
  this.set("updatingCard", false);
  this.stripe = StripeHelper.getStripe(Meteor.user());

  this.stripe.ready(function() {
    if(localCheckoutHandlers) {
      self.checkoutHandlers = localCheckoutHandlers;
    } else {
      self.checkoutHandlers = [];

      self.checkoutHandlers["add"] = self.stripe.getCheckoutHandler({
        amount: 0,
        description: "Verify Billing Info",
        panelLabel: "Add",
        token: self.updateCardWithFreePlan.bind(self)
      });

      self.checkoutHandlers["update"] = self.stripe.getCheckoutHandler({
        amount: 0,
        description: "Verify Billing Info",
        panelLabel: "Update",
        token: self.updateCardWithExistingPlan.bind(self)
      });

      localCheckoutHandlers = self.checkoutHandlers;
    }
  });

  this.onRendered(this.initTender);
  this.getCurrentUsage();
});

component.state.hasCard = function() {
  var user = Meteor.user();
  return !!(user && user.stripe && user.stripe.card);
};

component.state.cardMeta = function() {
  return this.getCardMeta();
};

component.state.billingInfo = function() {
  var user = Meteor.user() || {};
  return user.billingInfo;
};

component.state.appBreakdownChart = function() {
  var currentUsage = this.get("currentUsage");

  if(currentUsage) {
    return currentUsage.usageByApp;
  }
};

component.state.hasCurrentUsage = function() {
  var currentUsage = this.get("currentUsage");
  return currentUsage && !!currentUsage.total;
};

component.state.timeSeriesChartData = function() {
  var currentUsage = this.get("currentUsage");
  if(currentUsage) {
    var data = currentUsage.usageByTime.map(function (value) {
      return [value.time, value.count];
    });
    var endTime = currentUsage.reset.getTime();
    data = this.addFillerData(data, endTime);

    var series = [{name: "Number of Hosts", data: data}];
    return series;
  }
};

component.state.endTime = function() {
  var currentUsage = this.get("currentUsage");
  if(currentUsage) {
    var endTime = currentUsage.reset.getTime();
    return endTime;
  }
};

component.state.perHostBilledApps = function() {
  var currentUsage = this.get("currentUsage");
  if(currentUsage){
    currentUsage.hostsUsage = currentUsage.hostsUsage || [];
    return currentUsage.hostsUsage;
  }
};

component.action.updateBillingInfo = function(billingInfo) {
  var self = this;
  self.set("updatingBillingInfo", true);

  Meteor.call("account.update.billingInfo", billingInfo, function(err) {
    if(err) {
      growlAlert.error(err.reason || err.message);
    } else {
      growlAlert.success("Successfully updated the Billing Info.");
      self.set("updatingBillingInfo", false);
    }
  });
};

component.action.updateCard = function(action) {
  var self = this;
  self.stripe.ready(function() {
    self.checkoutHandlers[action].open();
  });
};

component.action.removeCard = function() {
  var self = this;
  self.set("removingCard", true);

  Meteor.call("account.remove.card", function(err) {
    if(err) {
      growlAlert.error(err.reason || err.message);
    } else {
      growlAlert.success("Your Credit Card is successfully removed.");
    }
    self.set("removingCard", false);
  });
};

component.prototype.getCurrentUsage = function() {
  var self = this;
  var userId = FlowRouter.getQueryParam("userId") || Meteor.userId();
  this.set("isChartLoading", true);
  Meteor.call("account.getUsage", userId, function (err, res) {
    if(!err && res) {
      var currentUsage = res;
      // var sumCounts = function (total, app) { return total + app.count; };
      currentUsage.percentage =
        100 * currentUsage.total/currentUsage.maximum;
      currentUsage.width = currentUsage.percentage;
      currentUsage.type = "success";

      if(currentUsage.percentage > 80) {
        currentUsage.type = "warning";
      }

      if(currentUsage.percentage > 100) {
        currentUsage.isOverLimit = true;
        currentUsage.type = "danger";
        currentUsage.width = 100;
      }

      currentUsage.startDate = currentUsage.start.toDateString();
      currentUsage.resetDate = currentUsage.reset.toDateString();

      self.set("currentUsage", currentUsage, true);
    }
    self.set("isChartLoading", false);
  });
};

component.prototype.getCardMeta = function() {
  var user = Meteor.user();
  if(user && user.stripe && user.stripe.card) {
    var lastFourDigits = user.stripe.card.last4;
    var expDate = user.stripe.card["exp_year"] +
      "/" + user.stripe.card["exp_month"];

    var data = {};
    data.lastFourDigits = lastFourDigits;
    data.expDate = expDate;

    return data;
  }
};

component.prototype.updateCardWithFreePlan = function(cardInfo) {
  this.set("updatingCard", true);

  this.updateCard(cardInfo, "free");
};

component.prototype.updateCardWithExistingPlan = function(cardInfo) {
  this.set("updatingCard", true);

  var user = Meteor.user();
  var plan = Utils.getPlanFromUser(user);

  this.updateCard(cardInfo, plan);
};

component.prototype.updateCard = function(cardInfo, plan) {
  var self = this;
  Meteor.call("account.update.card", cardInfo, plan, function(err) {
    if(err) {
      growlAlert.error(err.reason || err.message);
    } else {
      growlAlert.success("Your Credit Card is successfully updated.");
    }
    self.set("updatingCard", false);
  });
};

component.prototype.initTender = function() {
  var self = this;
  var script = "https://app.tender.io/Scripts/widgets/history.js";

  self.set("loadingTender", true);
  LoadScript(script, function(err) {
    if(err) {
      throw new Error("Can't load tender script: " + err.message);
    } else {
      self.identifyTenderCustomer();
    }
  });
};

component.prototype.identifyTenderCustomer = function() {
  var self = this;
  this.autorun(function() {
    var user = Meteor.user();
    // to prevent History() making more than one loading indicator
    this.cleanUpInvoiceElement();
    if(user && user.stripe && user.stripe.card && user.stripe.card.name) {
      var history = new InvoiceHistory.Widget.History();
      var email = user.stripe.card.name;
      history["identify_customer"]({
        id: Meteor.settings.public.tender.key,
        email: email
      });

      Meteor.call("account.getTenderAuthToken", function(err, response) {
        self.set("loadingTender", false);
        if(err) {
          throw err;
        }

        history["auth_customer"]({
          "date": response.now,
          "auth_token": response.authToken
        });
      });
    }
  });
};

component.prototype.cleanUpInvoiceElement = function() {
  var element = $("body").find("[data-ih-history]");
  element.empty();
};

component.extend(Mixins.CurrentChartTime);
component.extend(Mixins.TimeseriesFiller);
