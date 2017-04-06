StripeHelper = {
  instances: {}
};

if(Meteor.isServer) {
  ["kadirahq"].forEach(function(accountName) {
    var stripe = new StripeKonnect(accountName);
    stripe.configure(Meteor.settings.stripe[accountName]);
    StripeHelper.instances[accountName] = stripe;
  });
}

StripeHelper.getStripe = function() {
  if(Meteor.isServer) {
    return StripeHelper.instances["kadirahq"];
  } else {
    return new StripeKonnect("kadirahq");
  }
};