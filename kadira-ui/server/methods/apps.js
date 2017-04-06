/*eslint-disable new-cap*/
Meteor.methods({
  "apps.create": function(appName, pricingType) {
    check(appName, String);
    check(pricingType, Match.OneOf("free", "paid"));
    Validations.checkAppName(appName);

    if(!this.userId){
      throw new Meteor.Error(403, "user must login to create app");
    }
    // set users plan to app
    var plan = getPlanForApp(pricingType);
    var shard = KadiraData.mongoCluster.pickShard();
    var subShard = Math.floor(Math.random() * 128);

    var app = {
      name: appName,
      created: new Date(),
      owner: this.userId,
      secret: Meteor.uuid(),
      plan: plan,
      shard: shard,
      subShard: subShard,
      pricingType: pricingType
    };

    return Apps.insert(app);
  },
  "apps.updateName": function(appId, appName) {
    check(appId, String);
    check(appName, String);
    Validations.checkAppName(appName);
    Apps.update({_id: appId, owner: this.userId}, {$set: {name: appName}});
  },
  "apps.regenerateSecret": function(appId) {
    check(appId, String);
    var appSecret = Meteor.uuid();
    Apps.update({_id: appId, owner: this.userId}, {$set: {secret: appSecret}});
  },
  "apps.delete": function(appId){
    check(appId, String);
    Apps.remove({_id:appId, owner: this.userId});
    Alerts.remove({"meta.appId": appId});
  },
  "apps.updatePricingType": function(appId, pricingType){
    check(pricingType, Match.OneOf("free", "paid"));
    check(appId, String);
    var currentUserId = Meteor.userId();
    if(!currentUserId){
      throw new Meteor.Error(403, "You must login to update pricing");
    }

    var app = Apps.findOne({_id: appId}, {owner: 1, plan: 1}) || {};

    if(pricingType === "free" && app.plan !== "free") {
      KadiraAccounts.checkIsAppDowngradable(app, "free");
    }

    if(currentUserId !== app.owner){
      throw new Meteor.Error(403, "Only app owner can do that");
    }

    var plan = getPlanForApp(pricingType);
    var fields = {pricingType: pricingType, plan: plan};

    Apps.update({_id: appId}, {$set: fields});
  }
});

function getPlanForApp(pricingType) {
  switch (pricingType) {
  case "free":
    return "free";
  case "paid":
    return Utils.getPlanFromUser(Meteor.user());
  default:
    throw new Error("unknown pricing type");
  }
}
