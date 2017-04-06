var component = FlowComponents.define("main", function (params) {
  this.set("content", params.content);
  params.options = params.options || {};
  this.set("options", params.options);
  this.set("ignoreLoginCheck", params.options.ignoreLoginCheck);
});

component.state.isLoggedIn =  function () {
  return !!Meteor.userId() && !Meteor.loggingIn();
};

component.state.isLogginIn = function () {
  return Meteor.loggingIn();
};

