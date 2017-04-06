describe("app.dateNavigation", function() {
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

  it("user can create an app and route to that URL", function() {

    createFirstApp();

    var path = GlobalClient.getCurrentPath();
    var app = getApp("first-app");
    expect(path).to.be.equal("/apps/" + app._id + "/dashboard/overview");
  });

  it("change resolutions range from dropdown menu on dashboard", function() {

    createFirstApp();
    var app = getApp("first-app");
    GlobalServer.execute(function(appId) {
      Apps.update({_id: appId}, {$set: {plan: "pro"}});
    }, [app._id]);
    GlobalClient.goGetPath("/apps/" + app._id + "/dashboard/overview");

    GlobalClient.waitForDOM("#resolution");
    GlobalClient.click("#resolution");

    GlobalClient.waitForDOM("#resolution ul.dropdown-menu li.val-3600000 ");
    GlobalClient.click("#resolution ul.dropdown-menu li.val-3600000 a");

    var hasParam = GlobalClient.hasQueryParamInURL("range", "3600000");
    expect(hasParam).to.be.equal(true);

    GlobalClient.click("#resolution");
    GlobalClient.click("#resolution ul.dropdown-menu li.val-10800000");
    GlobalClient.sleep(100);

    hasParam = GlobalClient.hasQueryParamInURL("range", "10800000");
    expect(hasParam).to.be.equal(true);

    GlobalClient.click("#resolution");
    GlobalClient.click("#resolution ul.dropdown-menu li.val-28800000");

    GlobalClient.sleep(100);
    hasParam = GlobalClient.hasQueryParamInURL("range", "28800000");
    expect(hasParam).to.be.equal(true);

    GlobalClient.click("#resolution");
    GlobalClient.click("#resolution ul.dropdown-menu li.val-86400000");

    GlobalClient.sleep(100);
    hasParam = GlobalClient.hasQueryParamInURL("range", "86400000");
    expect(hasParam).to.be.equal(true);

    GlobalClient.click("#resolution");
    GlobalClient.click("#resolution ul.dropdown-menu li.val-604800000");

    GlobalClient.sleep(100);
    hasParam = GlobalClient.hasQueryParamInURL("range", "604800000");
    expect(hasParam).to.be.equal(true);

    GlobalClient.click("#resolution");
    GlobalClient.click("#resolution ul.dropdown-menu li.val-2592000000");

    GlobalClient.sleep(100);
    hasParam = GlobalClient.hasQueryParamInURL("range", "2592000000");
    expect(hasParam).to.be.equal(true);

  });

  it("switch to live mode", function() {

    createFirstApp();

    GlobalClient.click("button.filter-prev");
    GlobalClient.sleep(200);
    var date1 = GlobalClient.execute(function() {
      return FlowRouter.getQueryParam("date");
    });
    var hasParam = !!date1;
    expect(hasParam).to.be.equal(true);

    GlobalClient.click("#real-time-indicator");
    GlobalClient.sleep(100);
    var date2 = GlobalClient.execute(function() {
      return FlowRouter.getQueryParam("date");
    });
    hasParam = !!date2;
    expect(hasParam).to.be.equal(false);
  });

  it("show the date select popover", function() {

    createFirstApp();

    GlobalClient.click("#date-jump");
    GlobalClient.sleep(100);
    GlobalClient.waitForDOM(".date-select-popover");
    var isExist = GlobalClient.checkIfExist(".date-select-popover");
    GlobalClient.sleep(100);

    expect(isExist).to.be.equal(true);

  });

});

function getApp(appName) {
  var app = GlobalServer.execute(function(appName) {
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
  var app = getApp("first-app");

  GlobalServer.execute(function(appId) {
    Apps.update({_id: appId}, {$set: {initialDataReceived: Date.now()}});
  }, [app._id]);
  GlobalClient.sleep(100);
}
