PermissionsMananger.roles = {};

var AppCollection = null;
var AppCollectionReadyDep = new Tracker.Dependency();

Meteor.startup(function() {
  if(Meteor.isClient) {
    // when we load this from a package like kadia-data
    // it's possible to Apps to be null since it can't inject values to 
    // this package (when we are testing)
    // But, when we use this package inside the app, Apps is there
    if(typeof Apps !== 'undefined') {
      AppCollection = Apps;
      AppCollectionReadyDep.changed();
    }
  } else {
    if(typeof Apps !== 'undefined') {
      // this is for running inside the app
      AppCollection = Apps
    } else {
      // this is for when used inside a package like kadira-data
      var c = new Mongo.Collection('temp_roles_collection');
      AppCollection = c.rawDatabase().collection('apps');
      AppCollection.update = Meteor.wrapAsync(AppCollection.update, AppCollection);
      AppCollection.findOne = Meteor.wrapAsync(AppCollection.findOne, AppCollection);
    }
  }
});

PermissionsMananger.roles.addRoleForApp = function(appId, userId, role) {
  var fields = {
    $addToSet: {
      perAppTeam: {
        userId: userId,
        role: role
      }
    }
  };
  return AppCollection.update({_id: appId}, fields);
};

PermissionsMananger.roles.removeRoleForApp = function(appId, userId, role) {
  var fields = {
    $pull: {
      perAppTeam: {
        userId: userId,
        role: role
      }
    }
  };
  return AppCollection.update({_id: appId}, fields);
};

PermissionsMananger.roles.isAllowed = function(action, appId, userId) {
  if(!AppCollection) {
    AppCollectionReadyDep.depend();
    return false;
  };

  var app = AppCollection.findOne({_id: appId}) || {};
  app.perAppTeam = app.perAppTeam || [];
  var role;
  if(app.owner === userId) {
    role = "owner";
  } else {
    app.perAppTeam.forEach(function (roleInfo) {
      if(roleInfo.userId === userId) {
        role = roleInfo.role;
      }
    });
  }

  return PermissionsMananger.allowAction(action, role);
};


PermissionsMananger.roles.usersWithRole = function(appId, role) {
  if(!AppCollection) {
    AppCollectionReadyDep.depend();
    return [];
  };

  var app = AppCollection.findOne({_id: appId, "perAppTeam.role": role}) || {};
  app.perAppTeam = app.perAppTeam || [];
  var users = [];
  app.perAppTeam.forEach(function (roleInfo) {
    if(roleInfo.role === role) {
      users.push(roleInfo.userId);
    }
  });
  return users;
};

PermissionsMananger.roles.getUserApps = function(userId) {
  var apps = AppCollection.find({"perAppTeam.userId": userId});
  return apps;
};

PermissionsMananger.roles.getAppOwner = function(appId) {
  var app = AppCollection.find({_id: appId}, {fields: {"perAppTeam": 1}}) || {};
  app.perAppTeam = app.perAppTeam || [];
  var owner;
  app.perAppTeam.forEach(function (roleInfo) {
    if(roleInfo.role === "owner") {
      owner = roleInfo.userId;
    }
  });
  return owner;
};