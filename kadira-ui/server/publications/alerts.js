Meteor.publish("alerts", function(appId) {
  this.unblock();
  check(appId, String);
  var user = Meteor.users.findOne({_id: this.userId});
  if(user){
    var collFields = {
      _id: 1,
      meta: 1,
      rule: 1,
      triggers: 1,
      armedDate: 1
    };
    return Alerts.find({"meta.appId": appId}, {fields: collFields});
  }else {
    this.ready();
  }
});