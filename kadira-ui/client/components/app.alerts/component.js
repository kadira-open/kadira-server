var component = FlowComponents.define("app.alerts", function() {
  this.autorun(this.setModalVisibility);
  this.autorun(this.setViewMode);
  this.autorun(this.handleForceCreateMode);
  this.set("dialogTitle", "Alerts");
});

component.state.listingMode = function() {
  var mode = this.get("mode");
  return (mode === "list");
};

component.action.showDialog = function() {
  FlowRouter.setQueryParams({action: "alerts"});
};

component.action.closeDialog = function() {
  this.closeDialog();
};

component.action.showEditor = function(mode, alertId) {
  if(mode === "create") {
    var appId = FlowRouter.getParam("appId");
    var plan = Utils.getPlanForTheApp(appId);
    var alertsLimit = PlansManager.getConfig("alertsPerApp", plan);
    var alertsCount = Alerts.find({"meta.appId": appId}).count();

    if(alertsLimit <= alertsCount) {
      this.closeDialog();
      FlowRouter.setQueryParams({denied: "createNewAlert"});
    } else {
      FlowRouter.setQueryParams({mode: mode});
    }
  } else if(mode === "update") {
    FlowRouter.setQueryParams({
      mode: mode,
      alertId: alertId
    });
  }
};

component.action.showList = function() {
  FlowRouter.setQueryParams({mode: "list", alertId: null});
};

component.action.toggleEnable = function(alertId) {
  Meteor.call("alerts.toggleEnable", alertId);
};

component.action.createAlert = function(alertInfo) {
  var appId = FlowRouter.getParam("appId");
  alertInfo.meta.appId = appId;
  return new Promise(function(resolve, reject) {
    Meteor.call("alerts.create", alertInfo, function(err) {
      if(!err) {
        growlAlert.success("Alert Created Successfully.");
        resolve();
      } else {
        growlAlert.error(err.reason);
        reject(err);
      }
    });
  });
};

component.action.updateAlert = function(alertId, alertInfo) {
  var appId = FlowRouter.getParam("appId");
  alertInfo.meta.appId = appId;
  return new Promise(function(resolve, reject) {
    Meteor.call("alerts.update", appId, alertId, alertInfo, function(err) {
      if(!err) {
        growlAlert.success("Alert Updated Successfully.");
        resolve();
      } else {
        growlAlert.error(err.reason);
        reject(err);
      }
    });
  });
};

component.action.deleteAlert = function(alertId) {
  Meteor.call("alerts.delete", alertId, function(err) {
    if(!err) {
      growlAlert.success("Alert Deleted Successfully.");
    } else {
      growlAlert.error(err.reason);
    }
  });
};

component.prototype.closeDialog = function() {
  FlowRouter.setQueryParams({action: null, alert: null, mode: null});
};

component.prototype.handleForceCreateMode = function() {
  var canShow = this.get("canShow");
  if(!canShow) {
    return;
  }

  var appId = FlowRouter.getParam("appId");
  var count = Alerts.find({"meta.appId": appId}).count();
  if(count === 0) {
    FlowRouter.setQueryParams({mode: "create"});
    this.set("forceCreateMode", true);
  } else {
    FlowRouter.setQueryParams({mode: "list"});
    this.set("forceCreateMode", false);
  }
};

component.prototype.setModalVisibility = function() {
  var action = FlowRouter.getQueryParam("action");
  if(action === "alerts") {
    this.set("canShow", true);
  } else {
    this.set("canShow", false);
  }
};

component.prototype.setViewMode = function() {
  var mode = FlowRouter.getQueryParam("mode");
  var alertId = FlowRouter.getQueryParam("alertId");

  this.set("mode", mode);
  this.set("alertId", alertId);
};