var component = FlowComponents.define("debug.cpuProfiler", function() {
  this.reset();
});

component.action.fetchProfile = function(file) {
  if(!file) {
    file = this.$("input[name=pf-file-upload-btn]").prop("files")[0];
  }
  
  var reader = new FileReader();
  this.set("profileName", file.name);
  reader.readAsText(file, "UTF-8");
  reader.onload = this.onFileLoad.bind(this);
  reader.onerror = this.onUploadError;
};

component.action.resetCpuProfiler = function() {
  this.reset();
};

component.prototype.onFileLoad = function(evt) {
  try {
    var profile = JSON.parse(evt.target.result);
    this.setProfile(profile);
  } catch(e) {
    growlAlert.error("could not parse file provided");
  }
};

component.prototype.onUploadError = function() {
  console.log(arguments);
};

component.prototype.setProfile = function(pf) {
  var profile = new CPUProfile(pf);
  if(profile.type === "server") {
    // in the server, program takes a lot of CPU to do the profiling
    // so, we don't need to include that too
    profile.setRemovingPaths(["(program)"]);
  } else {
    // idle takes a lot of time and it's not a problem 
    // so, it adds unnessory overhead
    profile.setRemovingPaths(["(idle)"]);
  }

  profile.process();
  this.set("profiler", true);
  this.set("newProfile", false);
  this.set("profile", profile, true);
};

component.prototype.reset = function() {
  this.set("newProfile", true);
  this.set("profiler", false);
};