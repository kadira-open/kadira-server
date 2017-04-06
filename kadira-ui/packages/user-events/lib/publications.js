Meteor.publish(null, function() {
  if(this.userId) {
    var userFetchOptions = {fields: {"states": 1}};
    // TODO: use findFaster
    var user = Meteor.users.findOne(this.userId, userFetchOptions);
    if(user) {
      if(!user.states) {
        var now = (new Date).getTime();
        // we need to add states to the user object
        // but sametime we don't need to override any content
        // that's why we are adding this dummy element
        Meteor.users.update(this.userId, {$set: {"states.__inited": now}});
      }

      return Meteor.users.find(this.userId, userFetchOptions);
    } else {
      throw new Meteor.Error('weired not to have a user for id: ' + this.userId);
    }
  } else {
    this.ready();
  }
});