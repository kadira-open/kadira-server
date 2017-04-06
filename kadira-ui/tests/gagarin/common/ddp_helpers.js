DdpHelpers = {};

DdpHelpers.createUser = function(server, fields) {
  var userId = server.createUser(fields);
  return userId;
};

DdpHelpers.createApp = function(appName, pricingType) {
  pricingType = pricingType || "free"
  return this.call("apps.create", [appName, pricingType]);
};
