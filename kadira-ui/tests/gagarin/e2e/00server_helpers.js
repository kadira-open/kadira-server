ServerHelpers = {};
ServerHelpers.cleanUpUsers = function() {
  this.execute(function() {
    Meteor.users.remove({});
  });
};

ServerHelpers.createDummyApps = function(userId) {
  for (var i = 1; i < 6; i++) {
    var appName = "app-" + i;
    this.createApp(appName, userId);
  }
};

ServerHelpers.createApp = function(appName, userId, fields) {
  fields = fields || {};
  fields.name = appName;
  fields.owner = userId;
  fields.created = new Date();

  var appId = this.execute(function(appName, userId, fields) {
    return Apps.insert(fields);
  }, [appName, userId, fields]);
  return appId;
};

ServerHelpers.cleanUpApps = function() {
  this.execute(function() {
    Apps.remove({});
  });
};

ServerHelpers.cleanUpAlerts = function() {
  this.execute(function() {
    Alerts.remove({});
  });
};

ServerHelpers.removeApp = function(appId) {
  this.execute(function(appId) {
    Apps.remove({_id: appId});
  }, [appId]);
};

ServerHelpers.createUser = function(options) {
  var userId = this.execute(function (options) {
    return Accounts.createUser(options);
  }, [options]);
  return userId;
};

ServerHelpers.cleanUpPendingUsers = function(){
  GlobalServer.execute(function() {
    PendingUsers.remove({});
  });
};

ServerHelpers.getAppIdByName = function(appName) {
  var appId = this.execute(function(appName) {
    var app = Apps.findOne({name: appName}, {fields: {_id: 1}});
    return app._id;
  },[appName]);
  return appId;
};

ServerHelpers.getAppSecretByName = function(appName) {
  var appSecret = this.execute(function(appName) {
    var app = Apps.findOne({name: appName}, {fields: {secret: 1}});
    return app.secret;
  },[appName]);
  return appSecret;
};

ServerHelpers.isAppExists = function(appName) {
  var isExists = this.execute(function(appName) {
    var count = Apps.find({name: appName}).count();
    if (count>0){
      return true;
    }else{
      return false;
    }
  },[appName]);
  return isExists;
};

ServerHelpers.setAlertData = function(alertName, appId) {
   
  var data = {};
  data.alrtName = alertName;
  data.ruleType = "cpuUsagePercentage";
  data.condition = "lessThan";
  data.conditionValue = "1";
  if(data.ruleType === "avgLifetime"){
    data.conditionValue = data.conditionValue * 1000;
  }
  data.conditionValue = parseFloat(data.conditionValue) || 0;
  data.frequency = "continuously";
  data.duration = "2";
    //convert to minutes
  data.duration = parseInt(data.duration) * 1000 * 60 || 0; 
  data.host = "ALL";
  data.email = "me@thinkholic.com";
  data.webhook = "";
  data.rearmInterval = "3";
  data.rearmInterval = parseInt(data.rearmInterval) || 5;
  data.rearmInterval = data.rearmInterval * 1000 * 60; //convert to minutes 

    //create
  var alertInfo = {};
  var metaInfo = {};
  metaInfo.appId = appId;
  metaInfo.name = data.alrtName;
  metaInfo.rearmInterval = data.rearmInterval;

  alertInfo.meta = metaInfo;
    
  var ruleInfo = {};
  ruleInfo.type = data.ruleType;
  ruleInfo.params = {};
  ruleInfo.params.threshold = data.conditionValue;
  ruleInfo.params.condition = data.condition;
  ruleInfo.duration = data.duration;
  if(data.frequency === "atLeastOnce") {
    ruleInfo.duration = 0;
  }
  ruleInfo.hosts = [];
  if(!data.host) { data.host = "ALL"; }
  if(data.host === "ANY" || data.host === "ALL"){
    ruleInfo.hosts.push("$" + data.host);
  }
    
  alertInfo.rule = ruleInfo;
  alertInfo.triggers = [];

    // var emailList = data.email;
    // var urlList = data.webhook;

  var emailArr;
  var webhooksArr;

  emailArr = data.email.split("\n");

  validWebhook = true;
  webhooksArr = data.webhook.split("\n");

  var actionEmailInfo = {
    type: "email",
    params: {
      addresses: emailArr
    }
  };

  if(emailArr && emailArr.length > 0){
    alertInfo.triggers.push(actionEmailInfo);
  }

  var actionWebhookInfo = {
    type: "webhook",
    params: {
      urls: webhooksArr
    }
  };
  if(webhooksArr && webhooksArr.length > 0){
    alertInfo.triggers.push(actionWebhookInfo);
  }

  return alertInfo;
};