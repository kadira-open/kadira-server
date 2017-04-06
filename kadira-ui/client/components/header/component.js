var component = FlowComponents.define("header", function() {

});

component.state.isKadiraDebug = function() {
  var routeName = FlowRouter.getRouteName();
  return routeName === "debug";
};

component.state.isSignedIn = function() {
  return !!Meteor.userId();
};

component.state.canShowAdminNotice = function() {
  var user = Meteor.user() || {};
  var appId = FlowRouter.getParam("appId");
  if(appId) {
    var app = Apps.findOne({_id: appId}, {fields: {owner: 1}}) || {};
    return app.owner !== user._id && !!user.admin;
  } else {
    return false;
  }
};

component.state.canShowShareApp = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {owner: 1}});
  return !!app;
};

component.state.canShowAlertsNav = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {owner: 1}});
  return !!app;
};

component.state.canShowSeetingsTab = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {owner: 1}});
  return !!app;
};