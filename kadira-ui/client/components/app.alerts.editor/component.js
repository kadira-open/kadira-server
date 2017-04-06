var HOST = {
  "list": [
    {
      "key": "On all hosts",
      "value": "ALL",
      "selected": false
    },
    {
      "key": "On any host",
      "value": "ANY",
      "selected": false
    }
  ]
};

var component = FlowComponents.define("app.alerts.editor", function(props) {
  this.set("HOST", HOST.list);
  this.set("alertInfo", null);
  this.onCancel = props.onCancel;
  this.onCreateNewAlert = props.onCreateNewAlert;
  this.onUpdateAlert = props.onUpdateAlert;
  this.forceCreateMode = props.forceCreateMode;
  
  if(props.mode === "create") {
    this.set("editMode", false);
  } else if(props.mode === "update") {
    this.autorun(function(compute) {
      var alertInfo = getCurrentAlertInfo(props.alertId);
      if(alertInfo) {
        this.set("editMode", true);
        this.set("alertInfo", alertInfo);
        compute.stop();
      }
    });
  }
});

component.state.showCancelButton = function() {
  return !this.forceCreateMode;
};

component.action.backToList = function() {
  this.onCancel();
};

component.action.saveAlert = function(arg, data) {
  var self = this;
  self.set("loading", true);
  
  if(self.get("editMode")) {
    arg = "update";
  }

  var alertInfo = this.alertInfo(data);

  var validEmails = false;
  var validWebhook = false;

  var emailList = data.email;
  var urlList = data.webhook;

  var emailArr;
  var webhooksArr;

  if (Validations.isValidEmailList(emailList)) {
    validEmails = true;
    emailArr = data.email.split("\n");
  }

  if(Validations.isValidUrllList(urlList)) {
    validWebhook = true;
    webhooksArr = data.webhook.split("\n");
  }

  if(validEmails || validWebhook) {
    var actionEmailInfo = {
      type: "email",
      params: {
        addresses: emailArr
      }
    };

    if(emailArr && emailArr.length > 0) {
      alertInfo.triggers.push(actionEmailInfo);
    }

    var actionWebhookInfo = {
      type: "webhook",
      params: {
        urls: webhooksArr
      }
    };

    if(webhooksArr && webhooksArr.length > 0) {
      alertInfo.triggers.push(actionWebhookInfo);
    }

    if(arg === "create") {
      var createPromise = this.onCreateNewAlert(alertInfo);
      createPromise.catch(function(err) {
        growlAlert.error(err.message);
      }).then(function() {
        self.set("loading", false);
        self.onCancel();
      });
    } else if(arg === "update") {
      var updatePromise = this.onUpdateAlert(data.alertId, alertInfo);
      updatePromise.catch(function(err) {
        growlAlert.error(err.message);
      }).then(function() {
        self.set("loading", false);
        self.onCancel();
      });
    }
  } else {
    if(!validEmails) {
      growlAlert.error("Invalid email entry!");
    }
    if(!validWebhook) {
      growlAlert.error("Invalid webhook entry!");
    }
    self.set("loading", false);
  }
};

component.prototype.alertInfo = function(data) {
  var alertInfo = {};
  var metaInfo = {};
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
  if(data.host === "ANY" || data.host === "ALL") {
    ruleInfo.hosts.push("$" + data.host);
  }
  
  alertInfo.rule = ruleInfo;
  alertInfo.triggers = [];

  return alertInfo;
};

function getCurrentAlertInfo(alertId) {
  var alertInfo = Alerts.findOne({"_id": alertId});
  if(!alertInfo) {
    return;
  }

  var data = {};

  data.alertId = alertId;
  data.name = alertInfo.meta.name;

  var rearmInterval = (alertInfo.meta.rearmInterval / (1000 * 60)) || 5;
  data.rearm = rearmInterval;

  if(alertInfo.rule.hosts[0] === "$ANY") {
    data.host = "ANY";
  } else if(alertInfo.rule.hosts[0] === "$ALL") {
    data.host = "ALL";
  }

  for(var i = 0; i < HOST.list.length; ++i) {
    if(HOST.list[i].value === data.host) {
      HOST.list[i].selected = true;
    } else {
      HOST.list[i].selected = false;
    }
  }

  var emails;
  var webhooks;

  alertInfo.triggers.forEach(function(trigger) {
    var haveEmails = 
      trigger.type === "email" && 
      trigger.params.addresses && 
      trigger.params.addresses.length > 0;

    if(haveEmails) {
      emails = trigger.params.addresses.join("\n");
    }

    var haveWebhooks = 
      trigger.type === "webhook" && 
      trigger.params.urls && 
      trigger.params.urls.length > 0;
      
    if(haveWebhooks) {
      webhooks = trigger.params.urls.join("\n");
    }
  });

  data.emails = emails;
  data.webhooks = webhooks;

  data.ruleType = alertInfo.rule.type;
  data.condition = alertInfo.rule.params.condition;
  data.threshold = alertInfo.rule.params.threshold;

  data.duration = alertInfo.rule.duration;

  return data;
}