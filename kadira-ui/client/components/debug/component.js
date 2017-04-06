var component = FlowComponents.define("debug", function() {
  this.set("navigations", kdNavigation);

  this.currentUrl = this.get("currentUrl");
  
  this.debugConn = null;
  this.debugReadyHandle = null;
  this.authKey = null;

  this.autoConnect(this.currentUrl);
  this.onDestroyed(this.stopConnection);
  
  this.autorun(this.autoSelectSession);
  this.autorun(this.indicatedConnectStatus);
  this.autorun(this.connectToDebugApp);

  this.autorun(function() {
    var activeSession = this.get("currentSession");
    this.set("activeSession", activeSession);

    // save DebugSession
    if (activeSession) {
      var sessionFileName = getSessionFileName(activeSession);
      this.set("sessionFileName", sessionFileName);
      this.set("stringifiedSessionData", null);
    }
  });

  this.autorun(function() {
    // update currentUrl when Url Param changes
    var url = FlowRouter.getQueryParam("url");
    if (url) {
      this.saveUrl(url);
    }
  });
});

component.prototype.connectToDebugApp = function() {
  var self = this;
  var url = this.get("currentUrl");

  // reset when change the debug Url
  if(this.currentUrl !== url) {
    this.authKey = null;
    this.currentUrl = url;
  }

  this.stopConnection();
  this.debugConn = DDP.connect(url);

  // debugStore instance
  var options = {};
  options.debugConn = this.debugConn;
  var debugStore = new DebugStore(options);
  this.store = debugStore;

  this.set("debugUrl", null);
  this.set("canShowAuthKeyDialog", false);
  
  this.set("statusMessage", null);
  this.set("offlineSession", false);

  this.debugConn.call("kadira.debug.remote.getAppEnv", function(err, env) {
    if(err) {
      self.set("statusMessage", kdStatusMessages["olderVersion"]);
      return;
    }

    if(env === "development") {
      self.startDebugSession();
      self.set("statusMessage", kdStatusMessages["openDebugSession"]);
      return;
    }

    if(env === "production") {
      if(self.authKey) {
        self.connectToDebugAppWithAuthKey(self.authKey);
      } else {
        self.set("canShowAuthKeyDialog", true);
      }
    }
  });
};

component.prototype.connectToDebugAppWithAuthKey = function(authKey) {
  var url = this.get("currentUrl");
  
  this.set("statusMessage", null);
  this.authKey = authKey;

  if(this.authKey && (this.authKey !== "")) {
    this.debugConn.subscribe("kadira.debug.remote.auth", this.authKey);
    this.startDebugSession();

    var self = this;
    this.debugConn.call("kadira.debug.remote.createAccessToken", onConnect);
    function onConnect(error, token) {
      if(error) {
        self.set("statusMessage", kdStatusMessages["unauthorized"]);
        self.authKey = null;
      } else {
        if(token) {
          var debugUrl = getDebugUrl(url, token);
          self.set("debugUrl", debugUrl);

          self.set("statusMessage", kdStatusMessages["startDebugSession"]);
        }
      }
    }

    this.set("canShowAuthKeyDialog", false);
  }
};

component.prototype.startDebugSession = function() {
  // set the conn url to the local storage.
  // so we can load it automatically when came to this page.
  this.watchMessages();
  this.debugReadyHandle = 
    this.debugConn.subscribe("kadira.debug.remote.timeline");
};

component.prototype.resetDebugSession = function() {
  if(this.debugConn) {
    this.debugConn.call("kadira.debug.remote.reset");
  }
};

component.prototype.watchMessages = function() {
  var self = this;

  var original = this.debugConn["_livedata_data"];
  this.debugConn["_livedata_data"] = function(msg) {
    if(msg.msg === "added" && msg.collection === "kdTimeline") {
      var fields = msg.fields;
      self.store.addItem(fields.browserId, fields.clientId, fields.data);
    }
    return original.apply(this, arguments);
  };
};

component.prototype.resetAccessToken = function() {
  var self = this;
  this.debugConn.call("kadira.debug.remote.createAccessToken", afterCall);
  function afterCall(error, token) {
    if(token) {
      var url = self.get("currentUrl");
      var debugUrl = getDebugUrl(url, token);
      self.set("debugUrl", debugUrl);
    }
  }
};

component.prototype.clearTheCurrentSession = function() {
  if(this.debugConn) {
    var currentSession = this.get("currentSession");
    this.store.reset(currentSession);
  }
};

component.prototype.stopConnection = function() {
  if(this.debugConn) {
    this.debugConn.disconnect();
    this.set("currentActivityTime", null);
    this.set("currentSession", null);
    this.set("activities", null);
    this.store.reset();
  }
};

component.prototype.saveUrl = function(url) {
  var self = this;
  Tracker.nonreactive(function() {
    if(self.get("currentUrl") !== url) {
      Meteor._localStorage.setItem("kd-url", url);
      FlowRouter.setQueryParams({url: url});
      self.set("currentUrl", url);
    }
    self.connectToDebugApp();
  });
};

component.prototype.autoConnect = function(url) {
  this.saveUrl(url);
};

component.prototype.autoSelectSession = function() {
  var self = this;
  var sessions = this.store.getSessions();
  var currentSession = self.get("currentSession");

  if(sessions.length > 0 && !currentSession) {
    self.set("currentSession", _.last(sessions));
  }
};

component.prototype.setActiveSession = function(sessions) {
  var self = this;
  var currentSession = self.get("currentSession");

  if(sessions.length > 0 && !currentSession) {
    self.set("currentSession", _.last(sessions));
  }
};

component.prototype.indicatedConnectStatus = function() {
  // watch for the url change
  var dataArea = this.$(".data-area");
  this.get("currentUrl");
  if(this.debugConn) {
    if(this.debugConn.status().connected) {
      dataArea.css("opacity", "1");
    } else {
      dataArea.css("opacity", "0.3");
    }
  } else {
    dataArea.css("opacity", "0.3");
  }
};

// save/load DebugStore
component.prototype.onDebugStoreLoad = function(evt) {
  if (evt && evt.target && evt.target.result) {
    var ds = JSON.parse(evt.target.result);
    var connUrl = ds.connUrl;
    var session = ds.session;
    var data = ds.data;

    // validate the file input
    // before load it as a debug store
    if (typeof ds !== "object" ||
      !isValidUrl(connUrl) ||
      !isValidSessionId(session) ||
      typeof data !== "object"
    ) {
      growlAlert.error("Invalid file format!");
      return;
    }

    this.store.load(session, data);

    var offlineDebugUrl = getSessionFileName(session);
    this.set("offlineDebugUrl", "file://" + offlineDebugUrl + ".json");
    this.set("offlineSession", true);
    this.set("currentSession", session);

    FlowRouter.setQueryParams({url: null});
  }
}

component.prototype.onDebugStoreUploadError = function() {
  growlAlert.error("File upload error!");
  console.error(arguments);
};

function isValidUrl(url) {
  var regExp = new RegExp('http(s)*://(www.)*[A-Za-z0-9:/\.\-_]+', 'ig');
  return regExp.test(url);
}

function isValidSessionId(sessionId) {
  var regExp = new RegExp('[A-Za-z0-9]+ - [A-Za-z0-9]+', 'ig');
  return regExp.test(sessionId);
}

function getDebugUrl(appUrl, token) {
  var debugUrl = appUrl + "/?kadira_debug=true&access_token=" + token;
  return debugUrl;
}

function getSessionFileName(session) {
  return session.replace(new RegExp(' ', 'g'), '');
}