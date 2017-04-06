describe("app.share.resend_invite", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
    GlobalServer.cleanUpPendingUsers();
  });

  it("resend invite for ownership", function() {
    GlobalServer.execute( function() {
      var mock = sinon.mock(Email);
      mock.expects("send").twice().returns(null);
      Meteor._mock = mock;
    });
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

    var inviteId = getInviteId(client, "john@meteorhacks.com", appId);
    client.call("share.resendInvite", [inviteId]);

    GlobalServer.execute(function() {
      Meteor._mock.restore();
    });

  });
  it("resend invite for collaborator", function() {
    GlobalServer.execute( function() {
      var mock = sinon.mock(Email);
      mock.expects("send").twice().returns(null);
      Meteor._mock = mock;
    });
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
    var pendingUsers = client.collection("pendingUsers");

    expect(Object.keys(pendingUsers).length).to.be.equal(1);

    var inviteId = getInviteId(client, "john@meteorhacks.com", appId);
    client.call("share.resendInvite", [inviteId]);

    GlobalServer.execute(function() {
      Meteor._mock.restore();
    });

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