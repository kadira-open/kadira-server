describe("alerts", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
    GlobalServer.cleanUpAlerts();
  });

  it("create new alerts", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp2");

    client.subscribe("alerts", [appId]);

    var alertName = "TestAlert";
    var alertInfo = GlobalServer.setAlertData(alertName, appId);
    
    client.call("alerts.create", [alertInfo]);
    client.sleep(200);

    var alerts = client.collection("alerts");

    expect(Object.keys(alerts).length).to.equal(1);
  });

  it("create new alerts when alert duration greater than 60mins", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp3");

    client.subscribe("alerts", [appId]);

    var alertName = "TestAlert";
    var alertInfo = GlobalServer.setAlertData(alertName, appId);

    // set durtion greate than 60mins before create the alert
    alertInfo.rule.duration = 7200000;
    
    client.call("alerts.create", [alertInfo]);
    client.sleep(200);

    var alerts = client.collection("alerts");

    expect(alerts[Object.keys(alerts)[0]].rule.duration).to.equal(3600000);
    expect(Object.keys(alerts).length).to.equal(1);
  });

  it("update the alert", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp2");

    client.subscribe("alerts", [appId]);

    var alertName = "TestAlertX";
    var alertInfo = GlobalServer.setAlertData(alertName, appId);
    
    client.call("alerts.create", [alertInfo]);
    client.sleep(200);

    var alerts = client.collection("alerts");
    var alertId = alerts[Object.keys(alerts)[0]]._id;

    var alertNameToBeRename = "TestAlertXAfterNameChanged";
    alertInfo.meta.name = alertNameToBeRename;
    client.call("alerts.update", [appId, alertId, alertInfo]);
    client.sleep(300);

    alerts = client.collection("alerts");
    var newAlertName = alerts[Object.keys(alerts)[0]].meta.name;

    client.sleep(200);
    expect(alertNameToBeRename).to.be.equal(newAlertName);
  });

  it("toggle enable/disable alert status", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp2");

    client.subscribe("alerts", [appId]);

    var alertName = "TestAlert";
    var alertInfo = GlobalServer.setAlertData(alertName, appId);
    
    client.call("alerts.create", [alertInfo]);
    client.sleep(200);
    
    var alerts = client.collection("alerts");
    var alertId = alerts[Object.keys(alerts)[0]]._id;
    var previousAlertStatus = alerts[Object.keys(alerts)[0]].meta.enabled;

    client.call("alerts.toggleEnable", [alertId]);
    client.sleep(300);

    alerts = client.collection("alerts");
    var newAlertStatus = alerts[Object.keys(alerts)[0]].meta.enabled;

    client.sleep(200);
    expect(previousAlertStatus).not.to.be.equal(newAlertStatus);
  });

  it("delete alerts", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp4");

    var alertName = "TestAlert3";
    var alertInfo = GlobalServer.setAlertData(alertName, appId);
    
    client.call("alerts.create", [alertInfo]);
    client.sleep(200);

    client.subscribe("alerts", [appId]);

    var alerts = client.collection("alerts");
    var alertId = alerts[Object.keys(alerts)[0]]._id;
    
    client.sleep(200);

    client.call("alerts.delete", [alertId]);
    client.sleep(300);

    alerts = client.collection("alerts");
    client.sleep(300);
    expect(Object.keys(alerts).length).to.equal(0);
  });

});