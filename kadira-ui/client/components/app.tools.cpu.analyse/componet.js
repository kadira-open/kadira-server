var component = FlowComponents.define("app.tools.cpu.analyse", function(props) {
  this.setFn("jobInfo", props.jobInfoFn);

  this.onRendered(function() {
    this.autorun(function() {
      var profile = props.profileFn();
      if(profile) {
        // this third parameter indicate flow to fire this value right away
        // it does not do anykind of cloning and equality checks
        // if it does, then that's a waste of CPU time.
        // since this is a pretty big blob
        this.set("profile", profile, true);
      }
    });
  });
});

component.extend(Mixins.UiHelpers);

component.state.canShowShareButton = function() {
  var jobId = FlowRouter.getQueryParam("id");
  return !!jobId;
};

component.state.canGoBack = function() {
  var jobId = FlowRouter.getParam("jobId");
  var mode = FlowRouter.getQueryParam("mode");
  return mode === "upload" || !jobId;
};

component.action.goBack = function() {
  var appId = FlowRouter.getParam("appId");
  FlowRouter.go("/apps/"+ appId + "/tools/cpu-profiler");
};

component.state.shareLink = function() {
  var jobId = FlowRouter.getQueryParam("id");
  var url = "";
  if(jobId){
    url = Meteor.absoluteUrl("cpf/" + jobId, {secure: true});
  }
  return url;
};