describe("apps", function() {
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

  it("user can create first app", function() {
    createFirstApp();
    var app = getApp("first-app");
    expect(app.name).to.be.equal("first-app");
  });

  it("user can create an app and route to that URL", function() {

    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    var app = getApp("first-app");
    expect(path).to.be.equal("/apps/" + app._id + "/dashboard/overview");
  });

  it(
  "user submit an appname, got the error, then submit the correct one",
  function() {
    GlobalClient.createUserAndLogin();
    GlobalClient.goGetPath("/create-app");
    GlobalClient.sleep(100);

    GlobalClient.expectExist("#create-app-submit");
    GlobalClient.click("#create-app-submit"); // submit app with error input
    GlobalClient.sleep(100);
    // error message shows
    GlobalClient.expectExist("form#apps-create div.alert-danger");

    GlobalClient.setValue("#app-name", "test-app");
    GlobalClient.click("#create-app-submit");
    GlobalClient.sleep(100);

    var app = getApp("test-app");
    expect(app.name).to.be.equal("test-app");
  });


  it("when there is no data for the app, show a no data message", function() {
    createFirstApp();
    GlobalClient.expectExist("#no-data-wrapper");
  });

  it("once user receive initial data, no data msg will be gone", function() {

    createFirstApp();
    GlobalServer.execute( function() {
      Apps.update({}, {$set: {initialDataReceived: true}});
    });
    GlobalClient.sleep(300);
    GlobalClient.waitForDOM("#wrapper");
    GlobalClient.expectNotExist("#no-data-wrapper");
  });

  it("user should be able to create apps from the app switcher", function() {
    GlobalClient.createUserAndLogin();
    GlobalClient.goGetPath("/");
    GlobalClient.click("#main-navbar .navbar-left");
    GlobalClient.click("#main-navbar .create-app");
    var path = GlobalClient.getCurrentPath();
    expect(path).to.be.equal("/create-app");
    GlobalClient.setValue("#app-name", "switcher-app");
    GlobalClient.click("#create-app-submit");
    GlobalClient.waitForDOM("#wrapper");
    var app = getApp("switcher-app");
    expect(app.name).to.be.equal("switcher-app");
  });

  it(
  "user should be able to visit the app page by clicking applist arrow Icon",
  function() {
    createFirstApp();
    var app = getApp("first-app");
    var appId = app._id;

    GlobalClient.goGetPath("/");
    GlobalClient.sleep(100);
    GlobalClient.expectExist(".view-app-button:nth-child(1)");
    GlobalClient.click(".view-app-button:nth-child(1)");
    GlobalClient.sleep(100);
    var newPath = GlobalClient.getCurrentPath();
    var expectPath = "/apps/" + appId + "/dashboard/overview";
    expect(newPath).to.be.equal(expectPath);
  });

  it("when user visit to the '/' he can see all his apps listed ", function() {

    GlobalClient.createUserAndLogin();
    GlobalServer.createDummyApps(GlobalClient.userId());
    GlobalClient.goGetPath("/");
    GlobalClient.sleep(100);
    GlobalClient.expectExist(".app tr:nth-child(5) .view-app .view-app-link");
  });

  it("all created apps should be in the quick app switcher", function() {

    GlobalClient.createUserAndLogin();
    GlobalServer.createDummyApps(GlobalClient.userId());
    GlobalClient.sleep(100);
    //5 dummy apps are created checking for 6th because of create app button
    GlobalClient.expectExist("#main-navbar li:nth-child(6) .switch-app-link");
  });

  //Settigs Tab
  it("user can create an app and route to settings tab", function() {
    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path+"?action=settings");
    var newPath = GlobalClient.getCurrentPath();

    var app = getApp("first-app");
    var curPath = "/apps/"+app._id+"/dashboard/overview?action=settings";
    expect(newPath).to.be.equal(curPath);
  });

  it("check app name is correct on settings tab", function() {
    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path+"?action=settings");

    currentAppName = GlobalClient.getCurrentAppName();
    expect(currentAppName).to.be.equal("first-app");
  });

  it("check appId is correct on settings tab", function() {
    createFirstApp();

    var currentAppId = GlobalServer.getAppIdByName("first-app");

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path+"?action=settings");

    currentAppIdOnUI = GlobalClient.getCurrentAppId();
    expect(currentAppIdOnUI).to.be.equal(currentAppId);
  });

  it("check appSecret is correct on settings tab", function() {
    createFirstApp();

    var currentAppSecret = GlobalServer.getAppSecretByName("first-app");

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path+"?action=settings");

    currentAppSecretOnUI = GlobalClient.getCurrentAppSecret();
    expect(currentAppSecretOnUI).to.be.equal(currentAppSecret);
  });

  it("regenerate the appSecret", function() {
    createFirstApp();
    var currentAppSecret = GlobalServer.getAppSecretByName("first-app");

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path+"?action=settings");

    GlobalClient.sleep(400);

    GlobalClient.focus("#regenerate-app-tokens");
    GlobalClient.click("#regenerate-app-tokens");
    GlobalClient.focus("#regenerate-confirm");
    GlobalClient.click("#regenerate-confirm");

    GlobalClient.sleep(400);
    var newAppSecret = GlobalServer.getAppSecretByName("first-app");

    expect(newAppSecret).not.to.be.equal(currentAppSecret);
  });

  it("delete the app", function() {
    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    GlobalClient.goGetPath(path+"?action=settings");
    GlobalClient.sleep(400);

    GlobalClient.focus("#delete-app");
    GlobalClient.click("#delete-app");
    GlobalClient.focus("#delete-app-name");

    GlobalClient.sleep(200);

    currentAppName = GlobalClient.getCurrentAppName();
    GlobalClient.setValue("#delete-app-name", currentAppName);
    GlobalClient.focus("#delete-confirm");
    GlobalClient.click("#delete-confirm");
    GlobalClient.sleep(200);

    appIsExists = GlobalServer.isAppExists(currentAppName);

    expect(appIsExists).to.be.equal(false);
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
  GlobalClient.sleep(100);
}
