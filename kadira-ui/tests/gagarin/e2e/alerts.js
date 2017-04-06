describe("alerts", function() {
  beforeEach(function() {
    GlobalClient.logout();
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  afterEach(function() {
    GlobalClient.logout();
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
  });

  it("user can create an app and route to alerts tab", function() {
    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path + "?action=alerts");
    var newPath = GlobalClient.getCurrentPath();

    var app = getApp("first-app");
    var expectedPath =
      "/apps/" + app._id+"/dashboard/overview?action=alerts";
    expect(newPath).to.be.equal(expectedPath);
  });

  it("create new alert with filling some mandatory fields", function() {
    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path + "?action=alerts");
    GlobalClient.sleep(200);

    GlobalClient.setValue("#alrt-value", "1");
    GlobalClient.setValue("#alrt-duration", "1");
    GlobalClient.setValue("#alrt-name", "testalertname");
    GlobalClient.setValue("#alrt-email", "sds@sd.dom");

    GlobalClient.sleep(200);
    GlobalClient.click("#alrt-save");
    GlobalClient.sleep(500);

    var app = getApp("first-app");
    var expectedPath =
      "/apps/" + app._id + "/dashboard/overview?action=alerts&mode=list";
    var newPath = GlobalClient.getCurrentPath();
    expect(newPath).to.be.equal(expectedPath);
  });

  it("user can vist editor by clicking 'Create New' on alerts tab list page",
  function() {
    createFirstApp();
    var app = getApp("first-app");

    GlobalServer.execute(function(appId) {
      Apps.update({_id: appId}, {$set: {plan: "pro"}});
    }, [app._id]);

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path + "?action=alerts");
    GlobalClient.sleep(200);

    GlobalClient.setValue("#alrt-value", "1");
    GlobalClient.setValue("#alrt-duration", "1");
    GlobalClient.setValue("#alrt-name", "testalertname");
    GlobalClient.setValue("#alrt-email", "sds@sd.dom");

    GlobalClient.sleep(200);
    GlobalClient.click("#alrt-save");
    GlobalClient.sleep(200);

    GlobalClient.click("#create-alert");
    GlobalClient.sleep(200);

    var expectedPath =
      "/apps/" + app._id + "/dashboard/overview?action=alerts&mode=create";
    var newPath = GlobalClient.getCurrentPath();
    expect(newPath).to.be.equal(expectedPath);
  });

});

function getApp(appName) {
  var app = GlobalClient.execute(function(appName) {
    var app = Apps.findOne({name: appName});
    return app || {};
  }, [appName]);
  return app;
}

function createFirstApp(){
  GlobalClient.createUserAndLogin();
  GlobalClient.goGetPath("/");
  GlobalClient.setValue("#app-name", "first-app");
  GlobalClient.click("#create-app-submit");
  GlobalClient.waitForDOM("#no-data-wrapper");
}
