if(Meteor.isServer) {
  var cioServerConfig = Meteor.settings && Meteor.settings.cio;
  if(cioServerConfig) {
    cioOnServer(cioServerConfig.siteId, cioServerConfig.token);
  }
}

if(Meteor.isClient) {
  var cioClientConfig = Meteor.settings && Meteor.settings.public &&
    Meteor.settings.public.cio;

  if(cioClientConfig) {
    cioOnClient(cioClientConfig.siteId);
  }
}

function cioOnClient (siteId) {
  var cio = CustomerIo.init(siteId);

  Deps.autorun(function() {
    var user = Meteor.user();
    if(user) {
      var email = AccountsHelpers.getUserEmail(user);
      var properties = {};
      if(user.createdAt) {
        properties["created_at"] = Math.ceil(user.createdAt.getTime()/1000);
        properties.subscribed =
          (user.stripe && user.stripe.verified)? true: false;
        properties.plan = user.plan || "free";
        var millisAfterRegister = (Date.now() - user.createdAt.getTime());
        properties.daysAfterRegister =
          Math.ceil(millisAfterRegister / (1000 * 3600 * 24));
      }
      cio.identify(user._id, email, properties);
    }
  });

  UserEvents.on("event", function(category, type, data) {
    if(category === "user") {
      var event = category + "-" + type;
      var userId = Meteor.userId();
      if(userId) {
        cio.track(userId, event, data);
      }
    }
  });
}

function cioOnServer(siteId, token) {
  var cio = CustomerIo.init(siteId, token);
  UserEvents.on("event", function(category, type, data) {
    var event = category + "-" + type;
    var userId = data.userId;

    if(event === "user-register") {
      cio.identify(userId, data.email, data);
    }
    cio.track(userId, event, _.omit(data, "userId"));
  });
}
