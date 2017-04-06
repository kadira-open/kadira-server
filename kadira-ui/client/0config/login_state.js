LoginState.getCustomData = function() {
  var data = {
    loginToken: Meteor._localStorage.getItem('Meteor.loginToken')
  };

  return data;
};
