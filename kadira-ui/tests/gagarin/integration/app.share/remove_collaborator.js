describe("app.share.remove_collaborator", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
    GlobalServer.cleanUpPendingUsers();

    GlobalServer.execute(function() {
      var mock = sinon.mock(Email);
      mock.expects("send").atLeast(1).returns(null);
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
      client.call("share.removeCollaborator", ["not-exist-appId", "collabId"]);
    } catch(e) {
      msg = e.message;
    }
    expect(msg).to.be.equal("App Not found [403]");
  });

  it("current user can remove himself from collaborators", function() {
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

    var userId = GlobalServer.createUser({
      username: "john",
      password: "password",
      email: "john@meteorhacks.com"
    });
    client.login({user: {username: "john"}, password: "password"});
    client.call("share.acceptInvite", [inviteId]);
    var subId2 = client.subscribe("apps.userOwned");
    var subId3 = client.subscribe("apps.collaboratored");
    client.call("share.removeCollaborator", [appId, userId]);
    client.sleep(200);
    var apps = client.collection("apps");
    expect(Object.keys(apps).length).to.be.equal(0);
    client.unsubscribe(subId2);
    client.unsubscribe(subId3);
  });

  it("current owner can remove any collaborator", function() {
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

    var collabId = GlobalServer.createUser({
      username: "john",
      password: "password",
      email: "john@meteorhacks.com"
    });
    client.login({user: {username: "john"}, password: "password"});
    client.call("share.acceptInvite", [inviteId]);
    client.logout();

    client.login({user: {username: "joeschmoe"}, password: "password"});
    client.call("share.removeCollaborator", [appId, collabId]);
    client.logout();

    client.login({user: {username: "john"}, password: "password"});

    var subId2 = client.subscribe("apps.userOwned");
    var subId3 = client.subscribe("apps.collaboratored");

    client.subscribe("apps.collaboratored");
    var apps = client.collection("apps");

    expect(apps).to.be.equal(undefined);
    client.unsubscribe(subId2);
    client.unsubscribe(subId3);
  });

  it("colllaborator cannot remove another collaborator", function(){
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
    var inviteId1 = getInviteId(client, "john@meteorhacks.com", appId);
    client.logout();
    var collabId1 = GlobalServer.createUser({
      username: "john",
      password: "password",
      email: "john@meteorhacks.com"
    });
    client.login({user: {username: "john"}, password: "password"});
    client.call("share.acceptInvite", [inviteId1]);
    client.logout();

    client.login({user: {username: "joeschmoe"}, password: "password"});
    client.call("share.addCollaborator", [appId, "oliver@meteorhacks.com"]);
    var inviteId2 = getInviteId(client, "oliver@meteorhacks.com", appId);
    client.logout();
    GlobalServer.createUser({
      username: "oliver",
      password: "password",
      email: "oliver@meteorhacks.com"
    });

    client.login({user: {username: "oliver"}, password: "password"});
    client.call("share.acceptInvite", [inviteId2]);
    var msg;
    try {
      client.call("share.removeCollaborator", [appId, collabId1]);
    } catch(e){
      msg = e.message;
    }
    var expectedMsg = "You are not authorized to remove collaborators [403]";
    expect(msg).to.be.equal(expectedMsg);
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