describe("apps.create_app", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("get the app for the loggedIn user", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });

    client.login({user: {username: "joeschmoe"}, password: "password"});

    client.createApp("app1");
    var subId = client.subscribe("apps.userOwned");
    var subId2 = client.subscribe("apps.collaboratored");

    client.sleep(200);
    var apps = client.collection("apps");
    expect(Object.keys(apps).length).to.be.equal(1);
    client.unsubscribe(subId);
    client.unsubscribe(subId2);
  });
});

describe("app.settings_tab", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("update app name", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");
    client.subscribe("apps.collaboratored");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp");

    client.call("apps.updateName",[appId,"NewAppName"]);
    client.sleep(200);
    var apps = client.collection("apps");
    appName = apps[appId].name;

    expect(appName).to.be.equal("NewAppName");
  });

  it("regenerate app secret", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");
    client.subscribe("apps.collaboratored");

    client.login({user: {username: "ind"}, password: "password"});

    var appId = client.createApp("myTestApp");
    client.sleep(200);
    var apps = client.collection("apps");
    var appSecret = apps[appId].secret;

    client.call("apps.regenerateSecret",[appId]);
    client.sleep(200);
    newAppSecret = apps[appId].secret;

    expect(newAppSecret).not.to.be.equal(appSecret);
  });

  it("delete the app", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");
    client.subscribe("apps.collaboratored");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp2");

    // create few alerts for this app
    client.subscribe("alerts", [appId]);
    var alertName = "TestAlert1";
    var alertInfo = GlobalServer.setAlertData(alertName, appId);
    client.call("alerts.create", [alertInfo]);
    client.sleep(200);
    var alerts = client.collection("alerts");
    expect(Object.keys(alerts).length).to.equal(1);

    // delete the app
    client.call("apps.delete",[appId]);
    client.sleep(200);
    var apps = client.collection("apps");
    var numDocs = Object.keys(apps).length;

    expect(numDocs).to.be.equal(0);
    // check wheter alerts are deleted too
    expect(Object.keys(alerts).length).to.equal(0);
  });

});