var component = FlowComponents.define("app.settings.dialog", function() {

  this.autorun(()=> {
    var appId = FlowRouter.getParam("appId");
    var app = Apps.findOne({_id: appId}, {fields: {pricingType: 1, plan: 1}});
    var pricingType = app.pricingType;
    var plan = app.plan || "free";
    if(!app.pricingType && plan !== "free"){
      pricingType = "paid";
    }
    this.set("pricingType", pricingType);
  });
});

component.state.currentAppName = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {name: 1}});
  return app && app.name;
};

component.state.currentAppId = function() {
  return FlowRouter.getParam("appId");
};

component.state.currentAppSecret = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {secret: 1}});
  return app.secret;
};

component.action.savePricingType = function(newPricingType) {
  var appId = FlowRouter.getParam("appId");
  Meteor.call("apps.updatePricingType", appId, newPricingType, (err) => {
    if(err) {
      // reset UI
      var app = Apps.findOne({_id: appId}, {fields: {pricingType: 1}});
      var oldPricingType = app.pricingType;
      this.set("pricingType", newPricingType);
      this.set("pricingType", oldPricingType);

      growlAlert.error(err.reason);
    } else {
      growlAlert.success("Updated app successfully.");
    }
  });
};

component.action.updateAppName = function(appName) {
  var appId = FlowRouter.getParam("appId");
  Meteor.call("apps.updateName", appId, appName, function(err) {
    if(err) {
      growlAlert.error(err.reason);
    } else {
      growlAlert.success("Updated app successfully.");
    }
  });
};

component.action.regenerateAppSecret = function() {
  var appId = FlowRouter.getParam("appId");
  Meteor.call("apps.regenerateSecret", appId, function(err) {
    if(err) {
      growlAlert.error(err.reason);
    } else {
      growlAlert.success("Updated appSecret successfully.");
    }
  });
};

component.action.deleteApp = function(appName) {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {name: 1}});
  if (app.name === appName) {
    Meteor.call("apps.delete", appId, function(err) {
      if(err) {
        growlAlert.error(err.reason);
      } else {
        growlAlert.success("App deletion successfully.");
        Meteor.setTimeout(function() {
          FlowRouter.go("/");
        }, 0);
      }
    });
  }
  else {
    growlAlert.success("Please enter app name correctly to delete this app.");
  }
};

component.state.isOwner = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne(appId) || {};
  var owner = Meteor.users.findOne({_id: app.owner});
  return !!owner;
};

component.action.resetView = function() {
  resetView();
};

function resetView() {
  $(".app-delete-hidden-control").hide();
  $("#regenerate-confirm").hide();
  $("#regenerate-confirm-cancel").hide();
  $("#delete-app").removeAttr("disabled");
}
