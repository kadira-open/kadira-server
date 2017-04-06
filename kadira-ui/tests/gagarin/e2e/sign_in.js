describe("signIn", function() {

  beforeEach(function() {
    GlobalClient.logout();
    GlobalServer.cleanUpUsers();
  });

  afterEach(function() {
    GlobalClient.logout();
    GlobalServer.cleanUpUsers();
  });

  it("show sign-in if not signed in", function() {
    GlobalClient.goGetPath("/");

    GlobalClient.sleep(200);
    GlobalClient.expectVisible("#sign-in-with-meteor");
  });

  it("navigate to /sign-up", function() {
    var path = GlobalClient.goGetPath("/sign-up");
    GlobalClient.sleep(500);
    GlobalClient.waitForDOM("#sign-up-with-meteor");
    expect(path).to.be.equal("/sign-up");
  });

  it("sign-up and automatically redirected into '/'", function() {
    GlobalClient.goGetPath("/sign-up");
    GlobalClient.sleep(200);
    GlobalClient.waitForDOM("#sign-up-with-meteor");
    GlobalClient.createUserAndLogin();
    var path = GlobalClient.getCurrentPath();
    expect(path).to.be.equal("/");
  });

  it("when log out, automatically redirected to '/sign-in'", function() {
    GlobalClient.createUserAndLogin();
    GlobalClient.goGetPath("/");

    GlobalClient.logout();

    var path = GlobalClient.getCurrentPath();
    GlobalClient.waitForDOM("#sign-in-with-meteor");
    expect(path).to.be.equal("/sign-in");
  });

  it("can visit custom paths if even not logged in", function() {
    GlobalClient.execute( function(){
      FlowRouter.route("/custom/path", {
        action: function() {
        }
      });
    });
    var path = GlobalClient.goGetPath("/custom/path");
    expect(path).to.be.equal("/custom/path");
  });
});
