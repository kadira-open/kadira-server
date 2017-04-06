Meteor.publish("user.userInfo", function() {
  this.unblock();
  if(this.userId){
    var userFields = {
      emails: 1,
      plan: 1,
      apps: 1,
      admin: 1,
      createdAt: 1,
      introVideoSeen: 1,
      billingInfo: 1,
      stripe: 1,
      "services.meteor-developer.emails": 1
    };
    return Meteor.users.find({_id: this.userId}, {fields: userFields});
  } else {
    this.ready();
  }
});