var component = FlowComponents.find("debug");

component.state.debugEntry = function() {
  var activeSession = this.get("activeSession");

  var connStatus = this.debugConn.status();
  if(!connStatus.connected) {
    this.set("connStatus", connStatus.status);

    if(connStatus.status === "waiting") {
      this.set("connStatus", kdStatusMessages["waiting"]);
    }

    if(connStatus.status === "connecting") {
      this.set("connStatus", kdStatusMessages["connecting"]);
    }
  }
 
  if(!activeSession) {
    return true;
  }
};

component.state.shareUrl = function() {
  var baseUrl = "http://debug.kadiraio.com/debug";
  var currentUrl = this.get("currentUrl");
  return baseUrl + "?url=" + currentUrl;
};

component.state.connUrl = function() {
  var offlineSession = this.get("offlineSession");
  if (offlineSession) {
    return this.get("offlineDebugUrl");
  }
  
  return this.get("currentUrl");
};

component.state.saveEnabled = function() {
  return !this.get("offlineSession");
};

component.state.navs = function() {
  var navs = [
    {
      id: "debug",
      label: "Debug",
      componentName: "debug",
      defaultSubNav: null
    },
    {
      id: "cpu-profiler",
      label: "CPU Profiler",
      componentName: "debug.debug.cpuProfiler",
      defaultSubNav: null
    }
  ];

  return navs;
};

component.state.currentUrl = function() {
  var defaultUrl = "http://localhost:3000";
  var url = Meteor._localStorage.getItem("kd-url") || defaultUrl;
  return url;
};

component.state.debugStoreInstance = function() {
  return this.store;
};

component.state.sessions = function() {
  var sessions = this.store.getSessions();
  if(sessions.length === 0) {
    sessions.push("No sessions yet.");
  }

  sessions = _.map(sessions, function(session) {
    return {value: session, label: session};
  });
  
  return sessions;
};

component.state.loading = function() {
  var sessions = this.store.getSessions();
  if(sessions.length === 0) {
    return true;
  }
};

// navigations
component.state.currentNav = function() {
  return FlowRouter.getQueryParam("page") || "debug";
};

component.state.isCurrentNav = function(nav) {
  var currentNav = this.get("currentNav");
  if(currentNav) {
    return currentNav === nav;
  }
};

// authKey
component.state.authKeyDialogTitle = function() {
  return "Authenticate Kadira Debug";  
};