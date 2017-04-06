Meteor.methods({
  "errorsMeta.changeState": function(appId, errorName, errorType, status) {
    // latency compensation stub for "errorsMeta.changeState" method
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