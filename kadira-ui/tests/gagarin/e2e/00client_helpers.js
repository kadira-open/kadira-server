ClientHelpers = {};


ClientHelpers.goGetPath = function (path) {
  this.execute(function(path) {
    FlowRouter.go(path);
  }, [path]);
  this.sleep(100);
  var resultPath = this.getCurrentPath();
  return resultPath;
};

ClientHelpers.userId = function() {
  var userId = this.execute(function() {
    return Meteor.userId();
  });
  return userId;
};

ClientHelpers.getCurrentPath = function() {
  var resultPath = this.execute(function() {
    // return FlowRouter.current().context.path;
    return window.location.pathname + window.location.search;
  });
  return resultPath;
};

ClientHelpers.getCurrentAppName = function() {
  var appName = this.execute(function() {
    return $("#update-app-name").val();
  });
  return appName;
};

ClientHelpers.getCurrentAppId = function() {
  var appId = this.execute(function() {
    return $("#raw-app-id").val();
  });
  return appId;
};

ClientHelpers.getCurrentAppSecret = function() {
  var appSecret = this.execute(function() {
    return $("#raw-app-secret").val();
  });
  return appSecret;
};

ClientHelpers.createUserAndLogin = function() {
  var password = "" + Math.random();
  return this.signUp({
    username: "joeschmoe",
    password: password,
    email: "joe@schmoe.com"
  }).then(() => {
    return this.login("joeschmoe", password);
  });
};

ClientHelpers.hasQueryParamInURL = function(key, val) {

  var retValue = this.execute(function(key, val) {
    var param = FlowRouter.getQueryParam(key);
    if(param === val) {
      return true;
    } else {
      return false;
    }
  }, [key, val]);
  return retValue;
};
