describe("app.errors", function() {
  beforeEach(function() {
    GlobalServer.cleanUpUsers();
    GlobalServer.cleanUpApps();
    GlobalServer.execute(function() {
      ErrorsMeta.remove({});
    });
  });

  it("can subscribe to errorsMeta.single publication", function(){
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});
    
    var appId = client.createApp("app1");
    GlobalServer.execute(function(appId) {
      ErrorsMeta.insert({
        appId: appId,
        name: "errorName",
        type: "method",
        status: "fixing"
      });
    }, [appId]);
    client.subscribe("errorsMeta.single", [appId, "errorName", "method"]);
    var errorsMeta = client.collection("errorsMeta");

    var expectedResult = [{
      appId: appId,
      name: "errorName",
      type: "method",
      status: "fixing"
    }];

    var errorsMetaArray = [];
    for(var key in errorsMeta) {
      var obj = errorsMeta[key];
      delete obj._id;
      errorsMetaArray.push(obj);
    }
    expect(errorsMetaArray).to.be.eql(expectedResult);
  });

  it("change_error_status", function() {
    var client = createDdpClient(GlobalServer);
    GlobalServer.createUser({
      username: "joeschmoe",
      password: "password",
      email: "joe@schmoe.com"
    });
    client.login({user: {username: "joeschmoe"}, password: "password"});
    
    var appId = client.createApp("app1");
    GlobalServer.execute(function(appId) {
      ErrorsMeta.insert({
        appId: appId,
        name: "errorName",
        type: "method",
        status: "new"
      });
    }, [appId]);
    var methodArgs = [appId, "errorName", "method", "fixed"];
    client.call("errorsMeta.changeState", methodArgs);

    client.subscribe("errorsMeta.single", [appId, "errorName", "method"]);
    var expectedResult = [{
      appId: appId,
      name: "errorName",
      type: "method",
      status: "fixed"
    }];

    var errorsMeta = client.collection("errorsMeta");
    var errorsMetaArray = [];
    for(var key in errorsMeta) {
      var obj = errorsMeta[key];
      delete obj._id;
      errorsMetaArray.push(obj);
    }
    expect(errorsMetaArray).to.be.eql(expectedResult);
  });
});