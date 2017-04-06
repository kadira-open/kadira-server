IntercomSettings.userInfo = function(user, info) {
  if(!user.intercomHash) {
    return false;
  }

  info.email = AccountsHelpers.getUserEmail(user);
  info.name = AccountsHelpers.getName(user);
  info.plan = user.plan || "free";

  // Track activations
  // We assume, FastRender already sent data
  var activated = _.some(Apps.find().fetch(), function(app) {
    return app.initialDataReceived;
  });
  info.activated = activated;
};