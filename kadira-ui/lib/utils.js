Utils = {};
Utils.prettyDate = function(date) {
  return moment(date).format("dddd, MMM DD, YYYY HH:mm");
};

Utils.getPlanFromUser = function(user){
  return user.plan || "free";
};

Utils.getPlanForTheApp = function(appId) {
  if(!appId) {
    throw new Meteor.Error("No AppId");
  }
  var app = Apps.findOne({_id: appId}, {fields: {plan: 1}}) || {};
  return app.plan || "free";
};

Utils.isAdmin = function(user) {
  return !!user.admin;
};