FlowComponents.define("app.share.invite", function() {
  this.autorun(function() {
    var inviteId = FlowRouter.getParam("inviteId");
    Session.set("inviteId", inviteId);
  });
});

