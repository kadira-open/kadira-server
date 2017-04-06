Meteor.startup(function() {
  if(process.env.METEOR_ENV === "test") {
    Accounts.removeDefaultRateLimit();
  }
});
