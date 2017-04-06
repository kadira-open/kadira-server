var component = FlowComponents.define("apps.switcher", function() {

});

component.state.apps = function() {
  return Apps.find({}, {fields: {_id: 1, name: 1, owner: 1}});
};

component.action.switchTheApp = function(app) {
  var defaults = {
    section: "dashboard",
    subSection: "overview"
  };
  var appUrl = UrlStateManager.pathTo(app._id, null, null, defaults);
  FlowRouter.go(appUrl);
};

component.state.currentAppName = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {name: 1}});
  return app && app.name;
};

component.state.isCurrentAppOwner = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId}, {fields: {owner: 1}});
  return app.owner === Meteor.userId();
};

component.state.isOwner = function(owner) {
  return owner === Meteor.userId();
};