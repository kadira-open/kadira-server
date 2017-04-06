var component = FlowComponents.define("app.alerts.list", function(props) {
  this.showEditor = props.onClickCreateNew;
  this.onToggleEnable = props.onToggleEnable;
  this.onDeleteAlert = props.onDeleteAlert;
});

component.state.alerts = function() {
  var appId = FlowRouter.getParam("appId");
  return Alerts.find({"meta.appId": appId});
};

component.action.showEditor = function(mode, alertId) {
  this.showEditor(mode, alertId);
};

component.action.toggleEnable = function(alertId) {
  this.onToggleEnable(alertId);
};

component.action.deleteAlert = function(alertId) {
  this.onDeleteAlert(alertId);
};