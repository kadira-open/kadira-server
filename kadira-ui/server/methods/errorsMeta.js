Meteor.methods({
  "errorsMeta.changeState": function(appId, errorName, errorType, status) {
    check(appId, String);
    check(errorName, String);
    check(errorType, String);
    check(status, String);
    KadiraData._authorize(this.userId, null, {appId: [appId]});
    
    return ErrorsMeta.upsert({
      appId: appId,
      name: errorName,
      type: errorType,
    }, {
      $set: {
        status: status
      }
    });
  }
});