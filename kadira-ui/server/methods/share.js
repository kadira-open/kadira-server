Meteor.methods({
  "share.changeOwner": function(appId, email) {
    var isAllowed = PermissionsMananger.roles.isAllowed(
      "manage_collaborators", appId, this.userId);
    if(!isAllowed){
      throw new Meteor.Error(403, i18n("share.change_owner_not_permitted"));
    }
    // not checking any plans on purpose, checking if user is paid user when
    // new owner accepts app.
    check(appId, String);
    check(email, String);
    var app = Apps.findOne(appId);
    if(!app){
      throw new Meteor.Error(403, i18n("share.app_not_found"));
    }

    Validations.checkEmail(email);

    var inviteInfo = {
      email: email,
      type: "owner",
      app: appId,
      invitedAt: new Date()
    };
    var inviteId = PendingUsers.insert(inviteInfo);
    notifyPendingOwner(inviteId, app, email);
  },
  "share.addCollaborator": function(appId, email) {
    check(appId, String);
    check(email, String);
    var app = Apps.findOne(appId);
    if(!app){
      throw new Meteor.Error(403, i18n("share.app_not_found"));
    }

    var isAllowed = PermissionsMananger.roles.isAllowed(
      "manage_collaborators", appId, this.userId);

    if(!isAllowed){
      throw new Meteor.Error(403, i18n("share.add_collaborator_not_permitted"));
    }

    var plan = Utils.getPlanForTheApp(appId);
    if(!PlansManager.allowFeature("shareApps", plan)) {
      throw new Meteor.Error(403, i18n("share.upgrade_to_add_collaborators"));
    }

    var isAlreadyInvited = PendingUsers.findOne({app: appId, email: email});
    if(isAlreadyInvited) {
      var errorStr = i18n("share.pending_collaborator_already_invited", email);
      throw new Meteor.Error(403, errorStr);
    }

    Validations.checkEmail(email);

    var inviteInfo = {
      email: email,
      type: "collaborator",
      app: appId,
      invitedAt: new Date()
    };
    var inviteId = PendingUsers.insert(inviteInfo);
    notifyPendingCollaborator(inviteId, app, email);
  },
  "share.acceptInvite": function (inviteId){
    check(inviteId, String);
    if(this.userId){
      var pendingUser = PendingUsers.findOne(inviteId);
      if(!pendingUser){
        throw new Meteor.Error(403, i18n("share.invite_not_found"));
      }

      var app = Apps.findOne({_id: pendingUser.app},
        {fields: {owner: 1, perHostBilling: 1}});
      if(!app){
        throw new Meteor.Error(403, i18n("share.app_not_found"));
      }

      if(app.owner === this.userId) {
        throw new Meteor.Error(403, i18n("share.already_owner"));
      }

      var result;
      if(pendingUser.type === "owner"){
        // to accept a owner invited user should be a paid user
        var plan = Utils.getPlanFromUser(Meteor.user());
        var isAllowed = PlansManager.allowFeature("shareApps", plan);
        if(!isAllowed) {
          var errorMsg = i18n("share.only_paid_users_can_accept_apps");
          throw new Meteor.Error(403, errorMsg);
        }

        //make current owner a collaborator
        var ownerUpdateFields = {$addToSet: {apps: app._id}};
        Meteor.users.update({_id: app.owner}, ownerUpdateFields);

        //remove new owner from collaborators
        Meteor.users.update({_id: this.userId}, {$pull: {apps: app._id}});

        //apply app owner and users plan to app
        var appUpdateFields = {$set: {owner: this.userId}};

        result = Apps.update({_id: pendingUser.app}, appUpdateFields);
        KadiraAccounts.updateAppPlan(this.userId, plan);
      } else {
        var role = pendingUser.type;
        var collabUpdateFields = {
          $addToSet: {
            perAppTeam: {role: role, userId: this.userId}
          }
        };
        result = Apps.update({_id: app._id}, collabUpdateFields);
      }
      if(result > 0){
        PendingUsers.remove({_id: inviteId});
      }
      return app._id;
    }
  },
  "share.removePendingUser": function(inviteId) {
    check(inviteId, String);
    var invite = PendingUsers.findOne({_id: inviteId});

    if(!invite){
      throw new Meteor.Error(403, i18n("share.invite_not_found"));
    }

    var isAllowed = PermissionsMananger.roles.isAllowed(
      "manage_collaborators", invite.app, this.userId);
    if(!isAllowed){
      throw new Meteor.Error(403, i18n("share.remove_pending_user_denied"));
    }

    PendingUsers.remove({_id: inviteId});

  },
  "share.removeCollaborator": function(appId, collabId){
    check(collabId, String);
    check(appId, String);
    var app = Apps.findOne({_id: appId}, {fields: {owner: 1}});
    if(!app){
      throw new Meteor.Error(403, i18n("share.app_not_found"));
    }

    var isAllowed = PermissionsMananger.roles.isAllowed(
      "manage_collaborators", appId, this.userId);
    //a collaborator can remove himself from app, hence the OR
    if(isAllowed || collabId === this.userId){
      var updateFields = {
        $pull: {
          perAppTeam: {
            role: "collaborator",
            userId: collabId
          }
        }
      };
      Apps.update({_id: appId}, updateFields);
    } else {
      throw new Meteor.Error(403,
        i18n("share.remove_collaborator_not_permitted"));
    }
  },
  "share.resendInvite": function(inviteId) {

    check(inviteId, String);
    var invite = PendingUsers.findOne(inviteId);
    if(!invite){
      throw new Meteor.Error(403, i18n("share.invite_not_found"));
    }

    var isAllowed = PermissionsMananger.roles.isAllowed(
      "manage_collaborators", invite.app, this.userId);
    if(!isAllowed){
      throw new Meteor.Error(403, i18n("share.resending_invite_defenied"));
    }

    var app = Apps.findOne(invite.app);
    if(invite.type === "owner"){
      notifyPendingOwner(inviteId, app, invite.email);
    } else {
      notifyPendingCollaborator(inviteId, app, invite.email);
    }
  }
});

function notifyPendingCollaborator(inviteId, app, email){
  var inviteUrl = Meteor.absoluteUrl("invite/" + inviteId);
  var appUrl = Meteor.absoluteUrl("apps/"+app._id+"/methods/overview");
  var options = EmailConfig.from;
  options.html = EmailTemplates.notifyNewCollaborator({
    appLink: appUrl,
    inviteUrl: inviteUrl,
    appName: _.escape(app.name)
  });
  options.to = email;
  const subjectTmpl = i18n("share.pending_user_invite_email_tmpl_subject");
  options.subject = _.template(subjectTmpl)({
    appName: _.escape(app.name)
  });
  Meteor.defer(function() {
    Email.send(options);
  });
}

function notifyPendingOwner(inviteId, app, email) {
  var inviteUrl = Meteor.absoluteUrl("invite/" + inviteId);
  var appUrl = Meteor.absoluteUrl("apps/" + app._id + "/methods/overview");
  var options = EmailConfig.from;
  options.html = EmailTemplates.notifyNewOwner({
    appLink: appUrl,
    inviteUrl: inviteUrl,
    appName: _.escape(app.name)
  });
  options.to = email;
  const pendingOwnerSubjectTempl = i18n("share.notify_new_owner_subject");
  options.subject = _.template(pendingOwnerSubjectTempl)({
    appName: _.escape(app.name)
  });
  Meteor.defer(function() {
    Email.send(options);
  });
}
