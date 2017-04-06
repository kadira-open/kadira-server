var component = FlowComponents.define("app.share.dialog", function() {

});

component.extend(Mixins.UiHelpers);

component.state.owner = function(){
  return this.owner();
};

component.prototype.owner = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne(appId) || {};
  var owner = Meteor.users.findOne({_id: app.owner});
  if(owner){
    var email = AccountsHelpers.getUserEmail(owner);
    var options = {secure: true, default: "mm", size: 30};
    var picture = Gravatar.imageUrl(email, options);
    var ownerInfo = {
      _id: owner._id,
      email: email,
      picture: picture,
      profile: owner.profile
    };
    return ownerInfo;
  }
};

component.state.isOwner = function() {
  return !!this.owner();
};

component.state.isOwnerOrSelf = function(user) {
  return user._id === Meteor.userId() || !!this.owner();
};

component.state.isOwnerAndFreePlan = function() {
  var isOwner = this.get("isOwner");
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne(appId) || {};
  var plan = app.plan || "free";
  return isOwner && plan === "free";
};

component.state.pendingOwner = function() {
  var appId = FlowRouter.getParam("appId");
  return PendingUsers.findOne({app: appId, type: "owner"});
};

component.state.pendingUsers = function() {
  var appId = FlowRouter.getParam("appId");
  return PendingUsers.find({app: appId, type: "collaborator"});
};

component.state.collaborators = function() {
  var appId = FlowRouter.getParam("appId");
  if(appId){
    var users = PermissionsMananger.roles.usersWithRole(appId, "collaborator");
    return Meteor.users.find({_id: {$in: users}});
  }
};

component.state.collaboratorEmail = function(user) {
  return AccountsHelpers.getUserEmail(user);
};

component.state.collaboratorUsername = function(user) {
  var userName = user.profile && user.profile.name;
  return userName || user.email || AccountsHelpers.getUserEmail(user);
};

component.action.changeOwner = function() {
  var self = this;
  var newOwnerEmail = this.$("#app-change-owner-text").val();
  var appNameEntered = this.$("#app-change-app-name-text").val();

  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne(appId) || {};
  if(!newOwnerEmail){
    growlAlert.error(i18n("share.app_owner_email_empty"));
  } else if(!appNameEntered || appNameEntered.length === 0){
    growlAlert.error(i18n("share.enter_app_name_to_confirm"));
  } else if(!app || app.name !== appNameEntered){
    growlAlert.error(i18n("share.enter_app_name_to_confirm_failed"));
  }

  if((appNameEntered === app.name) && newOwnerEmail){
    Meteor.call("share.changeOwner", appId, newOwnerEmail, function(err){
      if(err) {
        growlAlert.error(err.reason);
      } else {
        var msg = i18n("share.changed_app_ownership_to", newOwnerEmail);
        growlAlert.success(msg);
        self.$("#form-change-app-owner").toggle();
        var toggleButton = self.$("#change-app-owner");
        toggleButton.attr("data-status", "change");
        toggleButton.html(i18n("common.change"));
      }
    });
  }
};

component.action.addCollaborator = function() {
  var self = this;
  var email = this.$("#collaborator").val();
  var appId = FlowRouter.getParam("appId");

  Meteor.call("share.addCollaborator", appId, email, function(err){
    if(err) {
      growlAlert.error(err.reason);
    } else {
      growlAlert.success(i18n("share.add_collaborator_success", email));
      self.$("#collaborator").val("");
    }
  });
};

component.action.removePendingUser = function(inviteId) {
  Meteor.call("share.removePendingUser", inviteId, function(err) {
    if(err) {
      growlAlert.error(err.reason);
    } else {
      growlAlert.success(i18n("share.cancel_invite_success"));
    }
  });
};

component.action.removeCollaboratorConfirm = function(collabId) {
  var appId = FlowRouter.getParam("appId");
  Meteor.call("share.removeCollaborator", appId, collabId, function(err) {
    if(err){
      growlAlert.error(err.reason);
    } else {
      growlAlert.success(i18n("share.remove_collaborator_success"));
    }
  });
};

component.action.resendInvite = function(inviteId) {
  Meteor.call("share.resendInvite", inviteId, function(err) {
    if(err){
      growlAlert.error(err.reason);
    } else {
      growlAlert.success(i18n("share.invite_again_success"));
    }
  });
};

component.extend(Mixins.upgradeNotifier);
