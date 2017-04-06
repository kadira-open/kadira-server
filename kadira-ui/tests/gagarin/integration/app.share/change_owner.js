describe("app.share.change_owner", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();

    GlobalServer.execute(function() {
      var mock = sinon.mock(Email);
      mock.expects("send").returns(null);
      Meteor._mock = mock;
    });
  });

  afterEach(function() {
    GlobalServer.execute(function() {
      Meteor._mock.restore();
    });
  });

  it("there is no app", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });

    client.login({user: {username: "joeschmoe"}, password: "password"});
    var denied = false;
    try {
      client.call("share.changeOwner", ["no-exists-appid", "joe@schmoe.com"]);
    } catch(e) {
      denied = true;
    }
    expect(denied).to.be.equal(true);
  });

  it("current user is not the owner", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});
    var appId = client.createApp("app1");

    client.logout();

    GlobalServer.createUser({
      username: "joe",
      password: "password",
      email: "joe@schmoe1.com"
    });
    client.login({user: {username: "joe"}, password: "password"});
    var denied = false;
    try {
      client.call("share.changeOwner", [appId, "joe@schmoe1.com"]);
    } catch(e) {
      denied = true;
    }
    expect(denied).to.be.equal(true);
  });

  it("add a pending owner", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});

    var appId = client.createApp("app1");
    GlobalServer.execute(function(appId) {
      Apps.update({_id: appId}, {$set: {plan: "pro"}});
    }, [appId]);

    client.call("share.changeOwner", [appId, "john@meteorhacks.com"]);
    client.subscribe("apps.pendingUsers", [appId]);
    var pendingUsers = client.collection("pendingUsers");

    expect(Object.keys(pendingUsers).length).to.be.equal(1);
    for(var key in pendingUsers){
      expect(pendingUsers[key].email).to.be.equal("john@meteorhacks.com");
    }
  });

  it("only paid users can accept ownership invite", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});

    var appId = client.createApp("app1");
    GlobalServer.execute(function(appId) {
      Apps.update({_id: appId}, {$set: {plan: "pro"}});
    }, [appId]);

    client.call("share.changeOwner", [appId, "john@meteorhacks.com"]);
    client.subscribe("apps.pendingUsers", [appId]);
    var pendingUsers = client.collection("pendingUsers");
    var inviteId;
    for(var key in pendingUsers){
      inviteId = key;
    }
    client.logout();

    var userId = GlobalServer.createUser({
      username: "john",
      password: "password",
      email: "john@meteorhacks.com"
    });
    GlobalServer.execute(function(userId) {
      Meteor.users.update({_id: userId}, {$set: {plan: "free"}});
    }, [userId]);
    client.login({user: {username: "john"}, password: "password"});
    var denied = false;
    try {
      client.call("share.acceptInvite", [inviteId]);
    } catch(e) {
      denied = true;
    }
    expect(denied).to.be.equal(true);
  });

  it("accept the pending (paid) owner and make him as an owner", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});

    var appId = client.createApp("app1");
    GlobalServer.execute(function(appId) {
      Apps.update({_id: appId}, {$set: {plan: "pro"}});
    }, [appId]);

    client.call("share.changeOwner", [appId, "john@meteorhacks.com"]);
    client.subscribe("apps.pendingUsers", [appId]);
    var pendingUsers = client.collection("pendingUsers");
    var inviteId;
    for(var key in pendingUsers){
      inviteId = key;
    }
    client.logout();

    var userId = GlobalServer.createUser({
      username: "john",
      password: "password",
      email: "john@meteorhacks.com"
    });
    GlobalServer.execute(function(userId) {
      Meteor.users.update({_id: userId}, {$set: {plan: "pro"}});
    }, [userId]);
    client.login({user: {username: "john"}, password: "password"});
    client.call("share.acceptInvite", [inviteId]);

    client.subscribe("apps.userOwned");
    client.subscribe("apps.collaboratored");
    var apps = client.collection("apps");
    expect(Object.keys(apps).length).to.be.equal(1);
  });

  it("remove pending owner and try to accept again", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});
    
    var appId = client.createApp("app1");
    GlobalServer.execute(function(appId) {
      Apps.update({_id: appId}, {$set: {plan: "pro"}});
    }, [appId]);

    client.call("share.changeOwner", [appId, "john@meteorhacks.com"]);
    client.subscribe("apps.pendingUsers", [appId]);
    client.collection("pendingUsers");
    var inviteId = getInviteId(client, "john@meteorhacks.com", appId);

    client.call("share.removePendingUser", [inviteId]);

    var msg;
    try {
      client.call("share.acceptInvite", [inviteId]);
    } catch (e){
      msg = e.message;
    }
    expect(msg).to.be.equal("Invite not found [403]");
  });
});


function getInviteId(client, email, appId){
  var subId = client.subscribe("apps.pendingUsers", [appId]);
  var pendingUsers = client.collection("pendingUsers");
  var inviteId;
  for(var key in pendingUsers){
    if(pendingUsers[key].email === email){
      inviteId = key;
    }
  }
  client.unsubscribe(subId);
  return inviteId;
}


