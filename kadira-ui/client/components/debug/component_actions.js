var component = FlowComponents.find("debug");

component.action.changeSession = function(session) {
  this.set("currentSession", session);
};

component.action.connectToDebugApp = function(url) {
  url = stripTrailingSlash(url);
  this.saveUrl(url);
};

component.action.connectToDebugAppWithAuthKey = function(authKey) {
  this.connectToDebugAppWithAuthKey(authKey);
};

component.action.resetDebugSession = function() {
  this.resetDebugSession();
};

component.action.resetAccessToken = function() {
  this.set("statusMessage", kdStatusMessages["connecting"]);
  this.resetAccessToken();
};

component.action.toggleFullScreen = function(arg) {
  if(arg === "enter") {
    $(".navbar").hide();
    $("#kd-header").hide();
    $(".btn-exit-full-screen").show();
  }

  if(arg === "exit") {
    $(".navbar").show();
    $("#kd-header").show();
    $(".btn-exit-full-screen").hide();
  }

  $(window).trigger("resize");
};

// save/load DebugStore
component.action.saveDebugStore = function() {
  var self = this;
  var currentSession = this.get("currentSession");
  
  return this.store.dump(currentSession).then(function(data) {
    var ds = {
      id: Random.id(),
      connUrl: self.get("currentUrl"),
      session: currentSession,
      data: data
    };
    self.set("stringifiedSessionData", JSON.stringify(ds));
    return true;
  });
};

component.action.loadDebugStore = function(fp) {
  if (!fp || (fp && fp.type !== "application/json")) {
    growlAlert.error("Invalid file format!");
    return;
  }

  if (fp) {
    var reader = new FileReader();
    reader.readAsText(fp, "UTF-8");
    reader.onload = this.onDebugStoreLoad.bind(this);
    reader.onerror = this.onDebugStoreUploadError;
  }
};

// authKey
component.action.closeAuthKeyDialog = function() {
  this.set("statusMessage", kdStatusMessages["unauthorized"]);
  this.set("canShowAuthKeyDialog", false);
};

function stripTrailingSlash(url) {
  if (url.substr(-1) === "/") {
    return url.substr(0, url.length - 1);
  }
  return url;
}

component.action.tester = function() {
  return 'aaa';
};
