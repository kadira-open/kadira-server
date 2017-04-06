var component = FlowComponents.define("forgotPassword", function() {
});

component.prototype.resetView = function() {
  this.set("error", null);
};

component.prototype.showError = function(error) {
  this.set("isLoading", false);
  if(error) {
    this.set("error", error.reason);
  } else {
    this.resetView();
    FlowRouter.go("/");
  }
};

component.action.forgotPassword = function() {
  var email = this.$("input[name=forgottenEmail]").val();
  Accounts.forgotPassword({email: email}, this.showError.bind(this));
  this.set("isLoading", true);
};