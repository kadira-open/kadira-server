Tracker.autorun(function () {
  var appId = FlowRouter.getParam("appId");
  if(!appId) {
    return;
  }

  if(!FlowRouter.subsReady()) {
    return;
  }

  Apps.findOne({_id: appId}, {fields: {perAppTeam: 1}});

  Meteor.subscribe("apps.collaborators", appId);
});
