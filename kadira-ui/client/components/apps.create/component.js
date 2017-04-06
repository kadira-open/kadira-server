var component = FlowComponents.define("apps.create", function() {
  this.set("error", null);
});

component.prototype.resetView = function() {
  this.set("error", null);
};

component.action.create = function(appName) {
  var self = this;
  $("#create-app-submit").button("loading");
  Validations.checkAppName(appName, function(err) {
    if(err){
      self.set("error", err.reason);
      $("#create-app-submit").button("reset");
      $("#app-name").focus();
    } else {
      self.resetView();
      var pricingType = $("input[name=app-pricing-type]:checked").val();
      Meteor.call("apps.create", appName, pricingType, function(error, appId) {
        if(error) {
          self.set("error", error.reason);
        } else {
          self.resetView();
          FlowRouter.go("/apps/" + appId + "/dashboard/overview");
        }
        $("#create-app-submit").button("reset");
      });
    }
  });
};
