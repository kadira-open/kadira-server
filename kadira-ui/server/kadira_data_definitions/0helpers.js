KadiraDataHelpers = {};

KadiraDataHelpers.divideWithZero = function (val1, val2, ignoreZeros) {
  if(ignoreZeros) {
    val1 = {$cond : [{$eq: [val2, 0]}, 0, val1]};
  }

  return {$divide: [
    val1,
    {$cond : [{$eq: [val2, 0]}, 1, val2]}
  ]};
};

KadiraDataHelpers.safeMultiply = function (a, b) {
  var aIfNull = {$cond: [ {$gt: [ a, 0 ]}, a, 0 ]};
  var bIfNull = {$cond: [ {$gt: [ b, 0 ]}, b, 0 ]};

  return {$multiply: [ aIfNull,bIfNull ]}
};

KadiraDataHelpers.removeExpireFlag = function (collection, appId, traceId) {
  var appId = (appId) ? appId[0] : null;
  var dbConn;
  if(!appId) {
    dbConn = KadiraData.mongoCluster.getConnection("one");
  } else {
    dbConn = KadiraData.getConnectionForApp(appId);
  }
  var coll = dbConn.collection(collection);
  coll.update({_id: traceId}, {$unset: {_expires: 1}}, function() {
  });
};
