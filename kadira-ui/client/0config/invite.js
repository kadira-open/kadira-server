Tracker.autorun(function (){
  //if users is not logged in when visiting the link. we need to apply
  //the invite after user log in.
  var inviteId = Session.get("inviteId");

  if(Meteor.userId() && inviteId){
    Meteor.call("share.acceptInvite", inviteId, function(err){
      if(err){
        growlAlert.error(err.reason);
      } else {
        FlowRouter.go("/");
        Session.set("inviteId", null);
      }
    });
  }
});
