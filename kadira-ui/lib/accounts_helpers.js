AccountsHelpers = {};
AccountsHelpers.isMeteorLoginConnected = function isMeteorLoginConnected(user){
  var isConnected = user && 
    user.services && 
    user.services["meteor-developer"] && 
    user.services["meteor-developer"].emails && 
    user.services["meteor-developer"].emails.length > 0;

  return isConnected;
};

AccountsHelpers.getUserEmail = function _getUserEmail(user){
  if(AccountsHelpers.isMeteorLoginConnected(user)){
    var primaryEmail = _.find(user.services && 
      user.services["meteor-developer"].emails, 
      function(email){ 
        return email.primary === true; 
      });

    primaryEmail = primaryEmail || {};
    var email = primaryEmail.address || 
      user.services["meteor-developer"].emails[0].address;
    return email;
  } else if(user.emails && user.emails[0].address){
    return user.emails[0].address;
  }
};

AccountsHelpers.getName = function(user) {
  if(user.billingInfo && user.billingInfo.name) {
    return user.billingInfo.name;
  } 

  if(user.profile && user.profile.name) {
    return user.profile.name;
  }
};