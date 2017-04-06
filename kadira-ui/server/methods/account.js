import LRU from 'lru-cache'

KadiraAccounts = {};
Stripe = StripeHelper.getStripe();

var usageCache = new LRU({max: 1000, maxAge: 1000 * 60 * 15});

KadiraAccounts.updateAppPlan = function(userId, newPlan, oldPlan) {
  var query = {owner: userId};
  var fields = {"plan": newPlan};

  //upgraded from free plan to paid.
  // move their paid apps to paid
  if(oldPlan === "free" && newPlan !== "free"){
    fields.pricingType = "paid";
  } else if (oldPlan !== "free" && newPlan === "free") {
    // user is moving to free plan from a paid plan.
    // move their paid apps to free
    fields.pricingType = "free";
  }

  return Apps.update(query, {$set: fields}, {multi: true});
};

KadiraAccounts.getUsage = function(userId) {
  check(userId, String);
  var currentUser = Meteor.user() || {};
  if(userId !== this.userId && !currentUser.admin) {
    throw new Meteor.Error("Unauthorized");
  }

  // get maximum sessions allowed for current plan
  var user = Meteor.users.findOne({_id: userId}) || {};
  var plan = user.plan || "free";
  var start = getSubscriptionStartDate(user);

  var maximumHosts = getHostsLimit(plan);
  var billingStart = getBillingStartDate(start);
  var billingReset = getBillingEndDate(start);

  var appsMap = getAppsMap(userId);

  var usageByApp = KadiraAccounts.getUsageByApp(
    userId, billingStart, appsMap);

  var total = calculateTotalHostsUsage(usageByApp);

  return {
    maximum: maximumHosts,
    start: billingStart,
    reset: billingReset,
    usageByApp: usageByApp,
    total: total
  };
};

KadiraAccounts.getTotalHostsUsage = function(userId) {
  var appsMap = getAppsMap(userId);
  var user = Meteor.users.findOne({_id: userId});
  var start = getSubscriptionStartDate(user);
  var usageByApp = KadiraAccounts.getUsageByApp(userId, start, appsMap);
  var totalUsage = calculateTotalHostsUsage(usageByApp);
  return totalUsage;
};


KadiraAccounts.getUsageByApp =
function (userId, start, appsMap) {
  // TODO remove this line, after fixing expire flag in Database
  // for now we are calculating in last 2 weeks usage only
  start = moment().subtract(2, "weeks").toDate();
  //XXX: We need to use this with multiple connections and then merge the result
  // get list of apps which belongs to the user
  // count total newSessions created after `start`

  if(usageCache.peek(userId)){
    return usageCache.get(userId);
  }

  var usageByApp = {};

  for(var appId in appsMap){
    var pipeline = [
      {
        $match: {
          "value.appId": appId,
          "value.startTime": {$gt: start},
          "value.res": "30min",
          "value.newSessions": {$gt: 0}
        }
      },
      {
        $group: {
          _id: {
            "y": { $year: "$value.startTime" },
            "m": { $month: "$value.startTime" },
            "d": { $dayOfMonth: "$value.startTime"},
            // It's possible to users to deploy multiple version few times
            // a day. That'w why we do need to group by the hour as well.
            "h": { $hour: "$value.startTime"},
            "host": "$value.host"
          }
        }
      },
      {
        $group: {
          _id: {
            "y": "$_id.y",
            "m": "$_id.m",
            "d": "$_id.d",
            "h": "$_id.h",
          },
          count: {$sum: 1}
        }
      },
      {
        $sort: {
          "_id.y": 1,
          "_id.m": 1,
          "_id.d": 1,
          "_id.h": 1
        }
      }
    ];
    var dbConn = KadiraData.getConnectionForApp(appId);
    var coll = dbConn.collection("systemMetrics");
    var data = Meteor.wrapAsync(coll.aggregate, coll)(pipeline);
    var noDataCount = missingDataPointsCount(data, start, new Date());

    var appName = appsMap[appId].name;
    usageByApp[appName] = KadiraAccounts._getMedianHostCount(data, noDataCount);
  }

  usageCache.set(userId, usageByApp);
  return usageByApp;
};

KadiraAccounts._getMedianHostCount = function(hostUsageByTime, noDataCount) {
  hostUsageByTime = hostUsageByTime || [];
  if(hostUsageByTime.length === 0){
    return 0;
  }
  var values = _.chain(hostUsageByTime)
                  .pluck("count")
                  .sortBy(function(num) { return num})
                  .value();
  var missingDataArr = Array(noDataCount).fill(0);
  values = missingDataArr.concat(values);

  var half = Math.floor(values.length / 2);
  var median;
  if(values.length % 2) {
    median = values[half];
  } else {
    median = (values[half - 1] + values[half]) / 2
  }
  return Math.floor(median);
};

Meteor.methods({
  "account.update.billingInfo": function(billingInfo) {
    check(billingInfo, Object);

    if(!this.userId) {
      throw new Meteor.Error("Unauthorized");
    }

    var user = Meteor.users.findOne({_id: this.userId});

    var modifier = {$set: {
      "billingInfo": billingInfo
    }};

    if(user.stripe && user.stripe.verified) {
      Stripe.customers.update(user.stripe.customerId, {
        metadata: billingInfo
      });
    }

    Meteor.users.update(user._id, modifier);
  },

  "account.update.card": function(cardInfo, plan) {
    check(cardInfo, Object);
    check(cardInfo.id, String);
    check(plan, String);

    if(!this.userId) {
      throw new Meteor.Error("Unauthorized");
    }

    var user = Meteor.users.findOne({_id: this.userId});

    var token = Stripe.tokens.retrieve(cardInfo.id);

    if(!user.stripe || !user.stripe.customerId) {
      var metadata = getMetaData(user);
      var customer = Stripe.customers.create({
        card: token.id,
        email: token.email,
        metadata: metadata
      });

      Meteor.users.update({_id: user._id}, {$set: {
        stripe: {verified: true, customerId: customer.id, card: token.card}
      }});
    } else {
      Stripe.customers.update(user.stripe.customerId, {
        card: token.id,
        email: token.email
      });

      Meteor.users.update({_id: user._id}, {$set: {
        "stripe.verified": true,
        "stripe.card": token.card
      }});
    }

    Meteor.call("account.update.plan", plan, token);
  },

  "account.update.plan": function (plan, token, isTrial) {
    check(plan, String);
    check(isTrial, Match.Optional(Boolean));
    check(token, Match.Any);

    var trialEnd = null;

    if(isTrial && plan === "pro"){
      trialEnd = moment().add(1, "weeks").unix();
    }

    if(!this.userId) {
      throw new Meteor.Error(403, "Unauthorized");
    }

    var user = Meteor.users.findOne({_id: this.userId});

    //cannot use Utils.getPlanFromUser() here
    //because we need to create subscription if user dont have a plan
    var oldPlan = user.plan || "free";
    if(oldPlan === plan) {
      //throw new Error("Already using the requested Plan");
      return;
    }

    if(isTrial && user.stripe && user.stripe.hasTrialled){
      //already used a trial
      throw new Meteor.Error(403,
        "You can not use trial version more than once");
    }

    var apps = Apps.find({owner: this.userId}) || [];
    // check whether user can downgrade with alerts and collaborators
    apps.map((app) => {
      KadiraAccounts.checkIsAppDowngradable(app, plan);
    });

    // allow downgrades to free plan without stripe info
    if(plan === "free") {
      updatePlan();
    } else {
      if(!user.stripe || !user.stripe.verified) {
        throw new Meteor.Error("400", "No Credit Card Added.");
      }

      createOrUpdateUser();
      updatePlan();
    }

    // track plan changes
    trackPlanChanges(oldPlan, plan, user);
    return;

    function createOrUpdateUser () {
      // create stripe user if it doesn't exist
      if(!user.stripe || !user.stripe.customerId) {
        check(token, Object);
        check(token.id, String);

        // validate token by getting info from the stripe servers
        // improves security by using only stripe provided information
        token = Stripe.tokens.retrieve(token.id);
        var metadata = getMetadata(user);
        var customer = Stripe.customers.create({
          card: token.id,
          email: token.email,
          metadata: metadata
        });
        Meteor.users.update({_id: user._id}, {$set: {
          stripe: {verified: true, customerId: customer.id, card: token.card}
        }});
        user = Meteor.users.findOne({_id: user._id});
      }

      // this can happen when user has removed his card
      if(user.stripe && !user.stripe.verified) {
        check(token, Object);
        check(token.id, String);
        Stripe.customers.update(user.stripe.customerId, {
          card: token.id,
          email: token.email
        });

        Meteor.users.update({_id: user._id}, {$set: {
          "stripe.verified": true,
          "stripe.card": token.card
        }});
      }
    }

    function updatePlan () {

      var params = {plan: plan};
      var updatedUserFields = {plan: plan};

      if(trialEnd){
        params["trial_end"] = trialEnd;
        updatedUserFields["stripe.hasTrialled"] = true;
      }

      if(user.stripe) {
        if(user.stripe.subscriptionId) {
          Stripe.customers.updateSubscription(
            user.stripe.customerId,
            user.stripe.subscriptionId,
            params
          );
        } else {
          var subInfo = Stripe.customers.createSubscription(
            user.stripe.customerId,
            params
          );

          _.extend(updatedUserFields, {
            "stripe.subscriptionId": subInfo.id,
            "stripe.subscriptionStart": new Date(subInfo.start * 1000)
          });
        }
      }

      Meteor.users.update({_id: user._id}, {$set: updatedUserFields});
      KadiraAccounts.updateAppPlan(user._id, plan, oldPlan);
    }
  },

  "account.remove.card": function() {

    if(!this.userId) {
      throw new Meteor.Error("Unauthorized");
    }

    var user = Meteor.users.findOne({_id: this.userId});

    if(!user.stripe) {
      throw new Meteor.Error("No Card");
    }

    if(!(user.stripe && user.stripe.customerId && user.stripe.card)) {
      // Nothing to do
      throw new Meteor.Error("No Card to remove");
    }
    var plan = Utils.getPlanFromUser(user);
    if(plan !== "free") {
      // User can't remove card while using a paid plan
      throw new Meteor.Error("Please downgrade to free plan");
    }

    Stripe.customers.deleteCard(user.stripe.customerId, user.stripe.card.id);

    Meteor.users.update({_id: user._id}, {
      $unset: {"stripe.card": 1},
      $set: {"stripe.verified": false}
    });
  },

  "account.getTenderAuthToken": function() {
    if(!this.userId) {
      throw new Meteor.Error("Unauthorized");
    }

    var user = Meteor.users.findOne(this.userId);

    if(user.stripe && user.stripe.card) {
      var tenderSecret = Meteor.settings.tender.secret;
      var email = user.stripe.card.name;
      var now = (new Date()).toUTCString();
      var signature = email + now + tenderSecret;

      var crypto = Npm.require("crypto");
      var authToken = crypto.createHash("md5").update(signature).digest("hex");
      return {
        now: now,
        authToken: authToken
      };
    } else {
      throw new Meteor.Error(400, "Add your card before getting invoice data!");
    }
  },

  "account.getUsage": KadiraAccounts.getUsage,
  "account.isCloseToHitUsageLimit": function(appId) {
    check(appId, String);
    this.unblock();
    if(!this.userId) {
      throw new Meteor.Error("Unauthorized");
    }
    var fields = {owner: 1, maxHosts: 1, plan: 1, pricingType: 1};
    var app = Apps.findOne({_id: appId}, {fields: fields});
    if(!app){
      throw new Meteor.Error(403, "app not found");
    }
    if(app.pricingType === "free"){
      // we dont check host usage limits for free apps
      return false;
    }
    var usage = KadiraAccounts.getTotalHostsUsage(app.owner);

    var owner = Meteor.users.findOne({_id: app.owner});
    var ownerPlan = owner.plan || "free";
    var hostsLimit = getHostsLimit(ownerPlan);
    return usage > hostsLimit;
  },
  "account.suggestPlan": function(userId) {
    check(userId, String);
    var currentUser = Meteor.user() || {};

    if(userId !== this.userId && !currentUser.admin) {
      throw new Meteor.Error("Unauthorized");
    }
    var user = Meteor.users.findOne({_id: userId}, {fields: {plan: 1}});
    if(!user){
      throw new Meteor.Error("user not found");
    }
    var currentUsage = KadiraAccounts.getTotalHostsUsage(userId);
    var plans = _.omit(PlansManager._configs["plansDef"], "_default", "solo");
    var suitablePlan;
    for(var p in plans) {
      var planInfo = plans[p];
      if(planInfo.hosts > currentUsage) {
        suitablePlan = p;
        break;
      }
    }

    if(!suitablePlan){
      suitablePlan = "custom";
    }
    return suitablePlan;
  }
});

function getMetaData(user, otherInfo) {
  var metadata = {userId: user._id};
  if(user.billingInfo) {
    _.extend(metadata, user.billingInfo);
  } else {
    _.extend(metadata, otherInfo);
  }
  return metadata;
}

function getSubscriptionStartDate(user) {
  var start;
  if(user.stripe && user.stripe.subscriptionStart){
    start = user.stripe.subscriptionStart;
  } else if(user.stripe && !user.stripe.subscriptionStart) {
    // This is a temporary fix to set start time for already migrated users
    var subInfo = Stripe.customers.retrieveSubscription(
      user.stripe.customerId,
      user.stripe.subscriptionId
    );
    start = new Date(subInfo.start * 1000);
    Meteor.users.update({_id: user._id}, {$set: {
      "stripe.subscriptionStart": start
    }});
  } else {
    start = user.createdAt;
  }
  return start;
}

function getAlertsGap(appId, plan) {
  var allowedAlertsCount = PlansManager.getConfig("alertsPerApp", plan);
  var currentUsage =
    Alerts.find({"meta.appId": appId}, {fields: {_id: 1}}).count();
  return allowedAlertsCount - currentUsage;
}

function getCollaboratorsGap(appId, plan) {
  var allowedCollaboratorsCount =
    PlansManager.getConfig("sharedUsersPerApp", plan);
  var app = Apps.findOne({_id: appId}, {fields: {perAppTeam: 1}});
  var currentUsage = 0;
  if(app && app.perAppTeam) {
    currentUsage = app.perAppTeam.length;
  }
  return allowedCollaboratorsCount - currentUsage;
}

function trackPlanChanges(oldPlan, newPlan, user) {
  var oldPlanRange = PlansManager.getConfig("allowedRange", oldPlan);
  var newPlanRange = PlansManager.getConfig("allowedRange", newPlan);
  var changeType = (newPlanRange > oldPlanRange)? "upgraded" : "downgraded";

  UserEvents.track("user", changeType, {
    userId: user._id,
    email: AccountsHelpers.getUserEmail(user),
    fromPlan: oldPlan,
    toPlan: newPlan
  });
}

function getHostsLimit(plan) {
  var planDef = PlansManager.getConfig("plansDef", plan);
  return planDef.hosts;
}

function getBillingStartDate(start) {
  var now = new Date();
  var billingStart = new Date(start);
  billingStart.setFullYear(now.getFullYear());
  billingStart.setMonth(now.getMonth());

  // start from previous month if we're behind billing date
  // e.g.
  //  billing on 10th Oct, current date is 8th October
  //  so current billing cycle starts from September
  if(now.getDate() < billingStart.getDate()) {
    billingStart.setMonth(billingStart.getMonth() - 1);
  }

  return billingStart;
}

function missingDataPointsCount(data, startDate, endDate) {
  // TODO use dates from start and end from billing cycle
  const timeDiff = endDate.getTime() - startDate.getTime();

  const count = Math.floor(timeDiff / (3600 * 1000));
  const diff = count - data.length;
  if(diff > 0) {
    return diff
  } else {
    return 0;
  }
}

function getBillingEndDate(start) {
  var d = getBillingStartDate(start);
  var mEndDate = moment(d).add(1, "months");
  return mEndDate.toDate();
}

function calculateTotalHostsUsage(usageByApp) {
  if(_.isEmpty(usageByApp)){
    return 0;
  }
  return _.reduce(usageByApp, function(total, count){ return total + count; });
}

function getAppsMap(userId) {
  var appsMap = {};
  Apps.find({
    owner: userId,
    plan:{$nin: ["free"]}
  }).fetch().forEach(function(app) {
    appsMap[app._id] = app;
  });
  return appsMap;
}

KadiraAccounts.checkIsAppDowngradable = function(app, plan) {
  var alertsGap = getAlertsGap(app._id, plan);
  if(alertsGap < 0) {
    var alerts = alertsGap * -1;
    throw new Meteor.Error(403, "You need remove " +
      alerts + " alert(s) from \'" + app.name +"\' to downgrade.");
  }

  var collaboratorsGap = getCollaboratorsGap(app._id, plan);
  console.log(app, plan, collaboratorsGap, alertsGap)
  if(collaboratorsGap < 0) {
    var collaborators = collaboratorsGap * -1;
    throw new Meteor.Error(403, "You need remove " +
      collaborators + " collaborator(s) from \'" +
      app.name +"\' to downgrade.");
  }
};
