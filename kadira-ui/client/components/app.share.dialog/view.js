Template["app.share.dialog"].events({
  "click #change-app-owner": function(e){
    e.preventDefault();
    $("#form-change-app-owner").toggle();
    var toggleButton = $("#change-app-owner");
    var status = toggleButton.attr("data-status");
    if(status === "change"){
      toggleButton.html(i18n("common.cancel"));
      toggleButton.attr("data-status", "cancel");
    } else {
      toggleButton.attr("data-status", "change");
      toggleButton.html(i18n("common.change"));
    }
  },
  "click #app-owner-change-confirm": function(e) {
    e.preventDefault();
    FlowComponents.callAction("changeOwner");
  },
  "click #add-collaborator": function(e) {
    e.preventDefault();
    FlowComponents.callAction("addCollaborator");
  },
  "click .remove-pending-user": function(e) {
    e.preventDefault();
    FlowComponents.callAction("removePendingUser", this._id);
  },
  "click .remove-collaborator": function(e) {
    e.preventDefault();
    $(e.target).siblings(".collaborator-delete-confirm").removeClass("hidden");
  },
  "click .collaborator-delete-confirm": function(e){
    e.preventDefault();
    FlowComponents.callAction("removeCollaboratorConfirm", this._id);
  },
  "click .resend-invite": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resendInvite", this._id);
  },
  "click .remove-owner-invite": function(e) {
    e.preventDefault();
    FlowComponents.callAction("removePendingUser", this._id);
  },
  "click .upgrade": function (e) {
    e.preventDefault();
    FlowComponents.callAction("upgradePlan");
  }
});
