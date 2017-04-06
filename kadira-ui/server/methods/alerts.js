Meteor.methods({
  "alerts.create": function(alertInfo) {
    check(alertInfo, Match.Any);

    alertInfo.meta.enabled = true;
    setAppName(alertInfo);

    alertInfo.meta.created = new Date();
    alertInfo.meta.createdBy = this.userId;

    var appId = alertInfo.meta.appId;
    var plan = Utils.getPlanForTheApp(appId);

    var alertsLimit = PlansManager.getConfig("alertsPerApp", plan);
    var alertsCount = Alerts.find({"meta.appId": appId}).count();

    // duration must be less than 60mins
    if(alertInfo.rule.duration > 3600000) {
      alertInfo.rule.duration = 3600000;
    }

    if(alertsLimit <= alertsCount) {
      throw new Meteor.Error(403, "Not allowed to create new alerts");
    } else {
      Alerts.insert(alertInfo);
    }
  }
});

Meteor.methods({
  "alerts.update": function(appId, alertId, alertInfo) {
    check(appId, String);
    check(alertId, String);
    check(alertInfo, Match.Any);

    var alert = Alerts.findOne({_id: alertId});

    // 'enabled' field is not sent when updating from createAlert view.
    if(alertInfo.meta.enabled === undefined) {
      alertInfo.meta.enabled = alert.meta.enabled;
    }

    // duration must be less than 60mins
    if(alertInfo.rule.duration > 3600000) {
      alertInfo.rule.duration = 3600000;
    }

    setAppName(alertInfo);

    // user should not be allowed to set 'created', 'createdBy' fields
    alertInfo.meta.created = alert.meta.created;
    alertInfo.meta.createdBy = alert.meta.createdBy;
    Alerts.update({_id: alertId}, {$set: alertInfo});
    return true;
  }
});

Meteor.methods({
  "alerts.delete": function(alertId) {
    check(alertId, String);
    return Alerts.remove({"_id": alertId});
  }
});

Meteor.methods({
  "alerts.toggleEnable": function(alertId) {
    check(alertId, String);
    var alert = Alerts.findOne({"_id": alertId});
    var enabled;
    if(alert.meta.enabled) {
      enabled = false;
    } else {
      enabled = true;
    }
    Alerts.update({_id: alertId}, {$set: {"meta.enabled":enabled}});
    return true;
  }
});

function setAppName(alertsInfo) {
  var appId = alertsInfo.meta.appId;
  var app = Apps.findOne(appId);
  alertsInfo.meta.appName = app.name;
}