// configurations for the allowRange
PlansManager.setConfig("allowedRange", {
  free: 1000 * 3600 * 38, // 38 hours
  solo: 1000 * 3600 * 38, // 38 hours
  startup: 1000 * 3600 * 27 * 15, //15 days
  pro: 1000 * 3600 * 27 * 95, // 95 days
  business: 1000 * 3600 * 27 * 95 // 95 days
});

PermissionsMananger.defineAction("data_access", [
  "collaborator", "owner", "admin"
]);

Apps = new Meteor.Collection('apps');
Apps.remove({});

// create the root user
Meteor.users.remove({});
RootUserId = Accounts.createUser({username: "root", password: "toor"});
Meteor.users.update({_id: RootUserId}, {$set: {plan: "business"}});

createAppForUser(RootUserId, 'appId');

GetClient = function() {
  var client = DDP.connect(process.env.ROOT_URL);

  var loginInfo = {
    user: {username: "root"}, password: "toor"
  };

  Meteor.wrapAsync(client.call, client)('login', loginInfo);
  return client;
};

CreateUserWithPlan = function(plan) {
  var userId = Random.id();
  Meteor.users.insert({_id: userId, plan: plan});

  return userId;
}

function createAppForUser(userId, appId) {
  appId = appId || Random.id();
  Apps.insert({_id: appId, owner: userId, shard: "one"});
  return appId;
}
CreateAppForUser = createAppForUser;

// DataColl = new Mongo.Collection('data-coll');

GetRawDataColl = function(appId) {
  var dbConn = KadiraData.getConnectionForApp(appId);
  var mongoDataColl = dbConn.collection('data-coll');
  return mongoDataColl;
};

var dbConn = KadiraData.getConnectionForApp('appId');
var mongoBrowserDataColl = dbConn.collection('browser-data-coll');
// send data to the browser
SetBrowserData = function() {
  
  var payload = {_id: 'one', aa: 10};
  Meteor.wrapAsync(mongoBrowserDataColl.remove, mongoBrowserDataColl)({});
  Meteor.wrapAsync(mongoBrowserDataColl.insert, mongoBrowserDataColl)(payload);
};
SetBrowserData();

KadiraData.defineMetrics('browser-metrics', mongoBrowserDataColl.collectionName, function() {
  return [{$match: {}}];
});
KadiraData.defineTraces('browser-traces', mongoBrowserDataColl.collectionName, function() {
  //to delay in "Client - fetchTraces - fetch traces with time related data - not caching" test
  Meteor._sleepForMs(200);
  return [{$match: {}}];
});

Utils = {
  isAdmin: function(){
    return false;
  }
};