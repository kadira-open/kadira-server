Template.signIn.events({
  "submit #sign-in-with-email": function(e, tmpl) {
    e.preventDefault();
    var email = tmpl.$("input[name=email]").val();
    var password = tmpl.$("input[name=password]").val();
    FlowComponents.callAction("signInWithEmail", email, password);
  },
  "click #sign-in-with-meteor": function(e) {
    e.preventDefault();
    FlowComponents.callAction("signInWithMeteor");
  },
  "click #sign-up-with-meteor": function(e) {
    e.preventDefault();
    FlowComponents.callAction("signUpWithMeteor");
  }
});