Meteor.publish("errorsMeta.single", function (appId, name, type) {
  check(appId, String);
  check(name, String);
  check(type, String);
  this.unblock();

  KadiraData._authorize(this.userId, null, {appId: [appId]});
  return ErrorsMeta.find({appId: appId, name: name, type: type});
});