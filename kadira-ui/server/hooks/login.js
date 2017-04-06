var originalUpdateOrCreateUserFromExternalService = 
  Accounts.updateOrCreateUserFromExternalService;

Accounts.updateOrCreateUserFromExternalService = 
  function(serviceName, serviceData) {
  //if logged in user can add it to his profile
    var loggedInUserId = Meteor.userId();
    if(serviceName === "meteor-developer" && loggedInUserId) {
      if(serviceData && serviceData.id) {
        var alreadyConnected = Meteor.users.findOne({
          "services.meteor-developer.id": serviceData.id
        });
        if(alreadyConnected && alreadyConnected._id !== loggedInUserId) {
          throw new Meteor.Error(403, 
          i18n("signIn.already_connected_meteor_dev_account"));
        } else {
          var setAttr = {};
          setAttr["services.meteor-developer"] = serviceData;
          Meteor.users.update({
            _id: loggedInUserId
          }, {
            $set: setAttr
          });
        }
      }
    }

    if(serviceName === "meteor-developer" && !loggedInUserId) {
      var isConnected = Meteor.users.findOne({
        "services.meteor-developer.id": serviceData.id
      });
      var user = getUser(serviceData.emails);
    /* if meteor developer is not connected and 
      email is registered to a kadira account */
      if(!isConnected && user) {
        var existingEmail = AccountsHelpers.getUserEmail(user);
        throw new Meteor.Error(403, i18n("signIn.already_registed_via_email", 
        existingEmail));
      }
    }
    return originalUpdateOrCreateUserFromExternalService.apply(this, arguments);
  };

function getUser(emails) {
  var emailsArray = [];
  emails.forEach(function(emailInfo) {
    emailsArray.push(emailInfo.address);
  });
  return Meteor.users.findOne({
    "emails.address": {
      $in: emailsArray
    }
  });
}