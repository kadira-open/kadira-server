describe("lib.autourl", function() {
  it("does nothing when it has no AUTO appId", function() {
    var response = GlobalClient.execute(function() {
      var a = new Autourl();
      var context = {params: {appId: "something-else"}};
      return a.handle(context);
    });

    expect(response).to.be.equal(false);
  });

  it("redirect with the appId taken from the previous context", function() {
    var appId = GlobalClient.promise(function(done) {
      var a = new Autourl();
      var redirect = function(pathDef, params) {
        done(params.appId);
      };
      a.trackPreviousContext({params: {appId: "old"}});
      var context = {params: {appId: "AUTO"}};
      return a.handle(context, redirect);
    });

    expect(appId).to.be.equal("old");
  });

  it("redirect with the appId taken from the Apps.collection", function() {
    var appId = GlobalClient.promise(function(done) {
      var originalFindOne = Apps.findOne;
      Apps.findOne = function() {
        return {_id: "old"};
      };
      var a = new Autourl();
      var redirect = function(pathDef, params) {
        Apps.findOne = originalFindOne;
        done(params.appId);
      };
      
      var context = {params: {appId: "AUTO"}};
      return a.handle(context, redirect);
    });

    expect(appId).to.be.equal("old");
  });

  it("redirect to home when there is no matching appId", function() {
    var pathDef = GlobalClient.promise(function(done) {
      var a = new Autourl();
      var redirect = function(pathDef) {
        done(pathDef);
      };
      
      var context = {params: {appId: "AUTO"}};
      return a.handle(context, redirect);
    });

    expect(pathDef).to.be.equal("/");
  });
});