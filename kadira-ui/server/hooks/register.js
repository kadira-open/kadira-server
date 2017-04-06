// Sending Email after User Registered

var format = Npm.require("util").format;

// Can only call onCreateUser once
Accounts.onCreateUser(function(options, user) {
  if(user) {
    Meteor.defer(function() {
      // sending welcome email and onboarding
      if(Meteor.settings.madmimi) {
        var username = Meteor.settings.madmimi.username;
        var apiKey = Meteor.settings.madmimi.apiKey;
        var userList = Meteor.settings.madmimi.userList;

        var userEmail = encodeURIComponent(AccountsHelpers.getUserEmail(user));
        var apiFormat = 
          "http://api.madmimi.com/audience_lists/" + 
          "%s/add?email=%s&username=%s&api_key=%s";
        var url = format(apiFormat, userList, userEmail, username, apiKey);

        console.info("sending user to the email list:", userEmail);
        HTTP.post(url, function(err, response) {
          // may be do retrying
          if(err) {
            var errorMessage = 
              "error sending user email: " + userEmail +
              " error: " + err.message;
            console.error(errorMessage);
          } else if(response.statusCode !== 200) {
            var warnMessage = 
              "error(not 200) sending user email: " + userEmail +
              " error: " + response.content;
            console.error(warnMessage);
          }
        });
      }

      // added to metrics
      UserEvents.track("user", "registered", {
        userId: user._id,
        email: AccountsHelpers.getUserEmail(user)
      });
    });
  }

  return user;
});
