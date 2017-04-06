describe("acounts.billingInfo", function() {
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

  it("user can login and route to accounts page", function() {
    GlobalClient.createUserAndLogin();
    GlobalClient.goGetPath("/");

    GlobalClient.goGetPath("/account");
    var newPath = GlobalClient.getCurrentPath();

    var expectedPath = "/account/billing";
    expect(newPath).to.be.equal(expectedPath);
  });

  it("update billing info", function() {
    GlobalClient.createUserAndLogin();
    GlobalClient.goGetPath("/");

    GlobalClient.goGetPath("/account/billing");
    GlobalClient.sleep(200);
    GlobalClient.waitForDOM("#name");

    var data = {};
    data.name = "test name";
    data.email = "test email";
    data.address1 = "address1";
    data.address2 = "address2";
    data.city = "the city";
    data.state = "the state";
    data.zip = "94";
    data.country = "LK";
    data.other ="other info";

    GlobalClient.setValue("#name", data.name);
    GlobalClient.setValue("#email", data.email);
    GlobalClient.setValue("#address-line-1", data.address1);
    GlobalClient.setValue("#address-line-2", data.address2);
    GlobalClient.setValue("#city", data.city);
    GlobalClient.setValue("#state", data.state);
    GlobalClient.setValue("#zip", data.zip);
    GlobalClient.setValue("#country", data.country);
    GlobalClient.setValue("#other-info", data.other);

    GlobalClient.sleep(200);
    GlobalClient.click("#update-billing-info");
    GlobalClient.sleep(200);

    GlobalClient.goGetPath("/account/plans");
    GlobalClient.goGetPath("/account/billing");

    GlobalClient.sleep(50);

    var newData = {};
    newData.name = GlobalClient.getValue("#name");
    newData.email = GlobalClient.getValue("#email");
    newData.address1 = GlobalClient.getValue("#address-line-1");
    newData.address2 = GlobalClient.getValue("#address-line-2");
    newData.city = GlobalClient.getValue("#city");
    newData.state = GlobalClient.getValue("#state");
    newData.zip = GlobalClient.getValue("#zip");
    newData.country = GlobalClient.getValue("#country");
    newData.other = GlobalClient.getValue("#other-info");

    GlobalClient.sleep(100);

    expect(data).to.be.eql(newData);
  });

});
