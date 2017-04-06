var component = FlowComponents.define("app.share", function() {
  this.autorun(this.setModalVisibility);
  this.set("dialogTitle", i18n("share.application_sharing"));
});

component.action.show = function() {
  FlowRouter.setQueryParams({"action": "share"});
};

component.action.onDialogClose = function() {
  FlowRouter.setQueryParams({action: null});
};

component.prototype.setModalVisibility = function() {
  var action = FlowRouter.getQueryParam("action");
  if(action === "share") {
    this.set("canShow", true);
  } else {
    this.set("canShow", false);
  }
};