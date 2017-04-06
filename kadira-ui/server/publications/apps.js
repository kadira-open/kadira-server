Meteor.publish("apps.userOwned", function() {
  this.unblock();
  if(this.userId) {
    return Apps.find({owner: this.userId}, {sort: {created: 1}});
  } else {
    return this.ready();
  }
});

Meteor.publish("apps.collaboratored", function() {
  this.unblock();
  if(this.userId){
    return PermissionsMananger.roles.getUserApps(this.userId);
  } else {
    return this.ready();
  }
});

Meteor.publish("apps.pendingUsers", function(appId) {
  check(appId, String);
  this.unblock();
  var isAllowed = PermissionsMananger.roles.isAllowed(
    "manage_collaborators", appId, this.userId);
  if(isAllowed){
    return PendingUsers.find({app: appId});
  } else {
    this.ready();
  }
});

Meteor.publish("apps.collaborators", function(appId){
  check(appId, String);
  this.unblock();

  var isAllowed = PermissionsMananger.roles.isAllowed(
    "manage_collaborators", appId, this.userId);

  if(!isAllowed) {
    return this.ready();
  }

  var app = Apps.findOne({_id: appId});
  if(!app){
    return this.ready();
  }

  var cursorsArr = [];

  if(app){
    var collabFields = {
      fields: {
        emails: 1,
        apps: 1,
        "profile.name": 1,
        "services.meteor-developer.emails": 1
      }
    };
    var users = PermissionsMananger.roles.usersWithRole(appId, "collaborator");
    cursorsArr.push(Meteor.users.find({_id: {$in: users}}, collabFields));
  }

  if(app){
    cursorsArr.push(PendingUsers.find({app: appId}));
  }

  return cursorsArr;
});

Meteor.publish("apps.admin", function(appId) {
  this.unblock();
  check(appId, String);
  var user = Meteor.users.findOne(this.userId);
  if(user && user.admin){
    return Apps.find({_id: appId});
  } else {
    this.ready();
  }
});