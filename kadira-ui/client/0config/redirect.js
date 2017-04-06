// redirect when user logs out
// we need to do this only after user logout
// that's what we doing with `previouslyLoggedIn`
var previouslyLoggedIn = null;
// redirecting user to login page after logout
Tracker.autorun(function() {
  if(previouslyLoggedIn && !Meteor.userId()) {
    FlowRouter.go("/sign-in");
  }
  previouslyLoggedIn = !!Meteor.userId();
});

// redirecting user to home page after successfull login
Accounts.onLogin(function() {
  var path = FlowRouter.current().path;
  if(path === "/sign-up" || path === "/sign-in"){
    FlowRouter.go("/");
  }
});