var component = FlowComponents.define("app.tools.cpu", function() {
  this.onRendered(function () {
    this.autorun(function() {
      var id = this.jobId();
      if(id) {
        this.loadRemoteProfile(id);
      }
    });
  });

  this.autorun(this.loadProfiles.bind(this));

  this.onDestroyed(function() {
    this.jobsHandle.stop();
  });
});

component.extend(Mixins.UiHelpers);

component.state.isLoadingJobs = function() {
  return !this.jobsHandle.ready();
};

component.state.createRemote = function() {
  var action = FlowRouter.getQueryParam("action");
  return action === "create";
};

component.state.createLocal = function() {
  var action = FlowRouter.getQueryParam("action");
  return action === "upload";
};

component.state.analyse = function() {
  var action = FlowRouter.getQueryParam("action");
  var isSharedProfileView = this.isSharedProfileView();
  return action === "analyse" || isSharedProfileView;
};

component.state.listJobs = function() {
  var action = FlowRouter.getQueryParam("action");
  var mode = FlowRouter.getQueryParam("mode");
  var jobId = FlowRouter.getParam("jobId");
  return !action && !mode && !jobId;
};

component.state.isProfileList = function() {
  var isProfileList = FlowRouter.getQueryParam("action");
  return !isProfileList;
};

component.state.jobsList = function() {
  var appId = FlowRouter.getParam("appId");
  return Jobs.find(appId);
};

component.state.isAllowed = function() {
  if(this.isSharedProfileView()){
    return true;
  } else {
    var appId = FlowRouter.getParam("appId");
    var plan = Utils.getPlanForTheApp(appId);
    return PlansManager.allowFeature("profiler", plan);
  }
};

component.state.prettifyCpuTime = function(date) {
  return this.prettifyCpuTime(date);
};

component.state.prettifyDate = function(date) {
  return this.prettifyDate(date);
};

component.action.create = function() {
  var appId = FlowRouter.getParam("appId");
  var plan = Utils.getPlanForTheApp(appId);
  if(PlansManager.allowFeature("remoteProfiling", plan)) {
    FlowRouter.setQueryParams({"action": "create"});
  } else {
    FlowRouter.setQueryParams({"denied": "remoteProfiling"});
  }
};

component.action.deleteJob = function(jobId) {
  Meteor.call("deleteJob", jobId, function(error){
    if(error){
      growlAlert.error(error.reason);
    } else {
      growlAlert.success(i18n("tools.delete_job_success"));
    }
  });
};

component.action.showAction = function(jobId, action) {
  if(action === "completed") {
    FlowRouter.setQueryParams({"action": "analyse", "id": jobId});
  }
};

component.action.newLocal = function() {
  FlowRouter.setQueryParams({"action": "upload"});
};

component.prototype.setProfile = function(pf) {
  var profileOptions = {
    removingPaths: {
      // for the server side CPU profiler, system takes a lot of time to
      // take the CPU profile.
      // So, that's why we shouldn't mention it.
      // otherwise, it'll be pretty hard to compare.
      "(program)": true
    }
  };
  var profile = new CPUProfile(pf, profileOptions);
  profile.process();

  // this third parameter indicate flow to fire this value right away
  // it does not do anykind of cloning and equality checks
  // if it does, then that's a waste of CPU time.
  // since this is a pretty big blob
  this.set("profile", profile, true);
};

component.prototype.isSharedProfileView = function() {
  return !!FlowRouter.getParam("jobId");
};

component.prototype.loadProfiles = function () {
  var appId = FlowRouter.getParam("appId");
  var limit = FlowRouter.getQueryParam("limit") || 20;

  var routeName = FlowRouter.getRouteName();
  var jobId = FlowRouter.getParam("jobId");
  // if in the shared view subscribe by id
  if(routeName === "sharedCpuProfile" && jobId) {
    this.jobsHandle = Jobs.subscribe(appId, {_id: jobId}, {limit: limit});
  } else {
    this.jobsHandle = Jobs.subscribe(appId, null, {limit: limit});
  }
};

// --- start localProfileUpload

component.action.fetchProfile = function() {
  var file = this.$("input[name=pf-file-upload-btn]").prop("files")[0];
  var reader = new FileReader();
  reader.readAsText(file, "UTF-8");
  reader.onload = this.onFileLoad.bind(this);
  reader.onerror = this.onUploadError;
};

component.prototype.onFileLoad = function(evt) {
  try {
    var profile = JSON.parse(evt.target.result);
    this.setProfile(profile);
    FlowRouter.setQueryParams({action: "analyse", mode: "upload"});
    // UserEvents.track('user', 'local-profiled');
  } catch(e) {
    growlAlert.error("could not parse file provided");
  }
};

component.prototype.onUploadError = function() {
  console.log(arguments);
};

// --- end localProfileUpload


// --- start remoteProfileCreate

component.action.createProfile = function(name, duration) {
  var appId = FlowRouter.getParam("appId");

  var job = new Job("cpuProfile", appId);

  job.setData({name: name, duration: duration}, function(error) {
    if(error) {
      growlAlert.error(error.reason);
    } else {
      FlowRouter.go("/apps/"+ appId + "/tools/cpu-profiler");
    }
  });
};

// --- end remoteProfileCreate


// --- start viewRemoteProfile
component.state.jobInfo = function() {
  var jobId = this.jobId();
  return Jobs.findOne(jobId);
};

component.prototype.jobId = function() {
  return FlowRouter.getQueryParam("id") || FlowRouter.getParam("jobId");
};

component.prototype.loadRemoteProfile = function(id) {
  this.set("profile", null);
  var self = this;
  var url = "https://profdata.kadira.io/" + id + ".js";
  var headers = {headers: {"Content-Type": "application/json"}};
  HTTP.get(url, headers, function(error, result){
    if(error && error.response.statusCode === 403){
      growlAlert.error(i18n("tools.could_not_load_cpu_profile"));
    }

    if(!error && result && result.data){
      self.setProfile(result.data);
    }
  });
};

// ---end viewRemoteProfile

component.extend(Mixins.upgradeNotifier);
