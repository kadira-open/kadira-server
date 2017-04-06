describe("app.share.add_collaborator", function() {
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
    var msg;
    try {
      var args = ["not-exist-appid", "john@schmoe.com"];
      client.call("share.addCollaborator", args);
    } catch(e) {
      msg = e.message;
    }
    expect(msg).to.be.equal("App Not found [403]");

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
    var msg;
    try {
      client.call("share.addCollaborator", [appId, "joe@schmoe1.com"]);
    } catch(e) {
      msg = e.message;
    }
    var expectedMsg = "You are not authorized to add collaborators [403]";
    expect(msg).to.be.equal(expectedMsg);
  });
  it("can't add already invited collaborator", function() {
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

    var msg;
    try {
      client.call("share.addCollaborator", [appId, "joe@schmoe1.com"]);
      client.call("share.addCollaborator", [appId, "joe@schmoe1.com"]);
    } catch(e) {
      msg = e.message;
    }
    var expectedMsg = "you have already invited " +
                     "joe@schmoe1.com to collaborate [403]";
    expect(msg).to.be.equal(expectedMsg);
  });

  it("accept the pending collaborator and became a collaborator", function() {
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

    client.call("share.addCollaborator", [appId, "john@meteorhacks.com"]);
    var inviteId = getInviteId(client, "john@meteorhacks.com", appId);
    client.logout();

    GlobalServer.createUser({
      username: "john",
      password: "password",
      email: "john@meteorhacks.com"
    });
    client.login({user: {username: "john"}, password: "password"});
    client.call("share.acceptInvite", [inviteId]);

    client.subscribe("apps.userOwned");
    client.subscribe("apps.collaboratored");

    var apps = client.collection("apps");
    expect(Object.keys(apps).length).to.be.equal(1);
  });

  it("remove pending collaborator and try to accept again", function() {
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
    
    client.call("share.addCollaborator", [appId, "john@meteorhacks.com"]);
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