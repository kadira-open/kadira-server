Meteor.methods({
  "userEvents.changeState": function(state, value) {
    check(state, String);
    check(value, Match.Any);
    if(this.userId) {
      var updatingFields = {};
      updatingFields['states.' + state] = value;
      Meteor.users.update(this.userId, {$set: updatingFields});
    } else {
      throw new Meteor.Error(403, "a logged in user required!");
    }
  }
});