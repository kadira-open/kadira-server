describe("insights.emailSettings", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("update email preferences", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp2");
    client.sleep(200);

    var apps = client.collection("apps");
    client.sleep(200);

    var app = apps[Object.keys(apps)[0]];
    var hasReports = false;
    if(app.reports) {
      hasReports = true;
    }

    // no reports
    expect(hasReports).to.be.equal(false);

    var emailFreq = "daily";
    var emailList = "me@thinkholic.com";

    client.call("insights.updateEmailPref", [appId, emailFreq, emailList]);
    client.sleep(200);

    emailList = emailList.split("\n");

    app = apps[Object.keys(apps)[0]];

    expect(emailFreq).to.equal(app.reports.frequency);
    expect(emailList).to.deep.equal(app.reports.emails);
  });

  it("change email frequency", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "ind",
      password: "password",
      email: "me@thinkholic.com"
    });

    client.subscribe("apps.userOwned");

    client.login({user: {username: "ind"}, password: "password"});
    var appId = client.createApp("myTestApp2");
    client.sleep(200);

    var apps = client.collection("apps");
    client.sleep(200);

    //update email pref.
    var emailFreq = "daily";
    var emailList = "me@thinkholic.com";

    client.call("insights.updateEmailPref", [appId, emailFreq, emailList]);
    client.sleep(200);

    emailList = emailList.split("\n");

    var app = apps[Object.keys(apps)[0]];
    
    var expectedEmailFreq = "weekly";
    client.call("insights.updateEmailFreq", [appId, expectedEmailFreq]);
    client.sleep(200);

    expect(expectedEmailFreq).to.equal(app.reports.frequency);
  });

});