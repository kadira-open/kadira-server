var component = FlowComponents.define("app.settings", function() {
  this.autorun(this.setModalVisibility);
  this.set("dialogTitle", i18n("settings.application_settings"));
});

component.action.show = function() {
  FlowRouter.setQueryParams({"action": "settings"});
};

component.action.closeDialog = function() {
  resetView();
  FlowRouter.setQueryParams({action: null});
};

component.prototype.setModalVisibility = function() {
  var action = FlowRouter.getQueryParam("action");
  if(action === "settings") {
    this.set("canShow", true);
  } else {
    this.set("canShow", false);
  }
};

function resetView() {
  $(".app-delete-hidden-control").hide();
  $("#regenerate-confirm").hide();
  $("#regenerate-confirm-cancel").hide();
  $("#delete-app").removeAttr("disabled");
}
