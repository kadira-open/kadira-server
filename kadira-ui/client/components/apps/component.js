var component = FlowComponents.define("apps", function() {

});

component.state.apps = function() {
  return Apps.find({});
};

component.state.haveApps = function() {
  return true
};

component.state.appUrl = function(appId) {
  var defaults = {
    section: "dashboard",
    subSection: "overview"
  };
  return UrlStateManager.pathTo(appId, null, null, defaults);
};

component.state.isOwner = function(owner) {
  return owner === Meteor.userId();
};
