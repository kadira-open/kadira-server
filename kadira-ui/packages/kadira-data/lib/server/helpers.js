/*
  additionalTimeSlots gives us the flexibilty to add or remove some timeslots
  to the calculation
*/

KadiraData._authorize = function(userId, dataKey, args) {
  // making appId an array
  // XXX: We may be not using this feature.
  // If we are using it we can't get the use of sharding
  // Since shard is only look for the first item in the array
  args = args || {};
  if(!(args.appId instanceof Array)) {
    args.appId = [args.appId];
  }

  // to support _id fetching
  if(args && args.query && args.query._id) {
    // For the security purpose we need to all the keys except appId and query
    // In the query also, we need to keep just id
    var query = {_id: args.query._id};
    // AppId is used for sharding. That's why we keep this.
    var appId = args.appId;
    Object.keys(args).forEach(function(key) {
      delete args[key];
    });

    args.query = query;
    args.appId = appId;
    return;
  }

  if(!userId) {
    throw new Meteor.Error("400", "Unauthorized Access");
  }

  var user = Meteor.users.findOne({_id: userId}, {plan: 1});
  if(!user) {
    throw new Meteor.Error("500", "Coundn't find the user");
  }

  // check date range
  if(!args.realtime && args.time) {
    var requestedRange = Date.now() - args.time.getTime();

    args.appId.forEach(function(appId) {
      var plan = Utils.getPlanForTheApp(appId);
      var allowedRange = PlansManager.getConfig("allowedRange", plan);
      if(requestedRange > allowedRange) {
        throw new Meteor.Error("400", "Cannot access this date range");
      }
    });
  }

  if(Utils.isAdmin(user)){
    return;
  }

  args.appId.forEach(function(appId) {
    if(!PermissionsMananger.roles.isAllowed('data_access', appId, userId)) {
      throw new Meteor.Error("400", "This appId is not yours");
    }
  });
};

KadiraData._ResolutionToMillis = function(resolution) {
  if(resolution === '1min') {
    return 1000 * 60;
  } else if(resolution === '30min') {
    return 1000 * 60 * 30;
  } else if(resolution === '3hour') {
    return 1000 * 60 * 60 * 3;
  } else {
    throw new Error('unsupported resolution: ', resolution);
  }
};

KadiraData._RoundToResolution = function(date, resolution, ceil) {
  var baseTimeMillis = date.getTime();
  var resMillies = KadiraData._ResolutionToMillis(resolution);
  var remainder = baseTimeMillis % resMillies;
  if(ceil) {
    return new Date(baseTimeMillis + (resMillies - remainder));
  } else {
    return new Date(baseTimeMillis - remainder);
  }
};

/*
  Calculate the date range with the given date and the resolution
*/
KadiraData._CalculateDateRange = function(date, range) {
  var timeDiff = range / 2;
  return {
    $gte: new Date(date.getTime() - timeDiff),
    $lt: new Date(date.getTime() + timeDiff)
  };
};

KadiraData._CalulateRealtimeDateRange = function(resolution, range) {
  var now = KadiraData._RoundToResolution(new Date(), resolution);
  var lastPossibleDate =
    new Date(now.getTime() - range);
  return {
    $lt: new Date(),
    $gte: lastPossibleDate
  };
};

var TraceCollectionMap = {
  method: 'methodTraces',
  pub: 'pubTraces',
  errors: 'errorTraces'
};

KadiraData._getTraceCollectionName = function(type) {
  var collectionName = TraceCollectionMap[type];
  if(!collectionName) {
    var message = 'Do not allow types other than method & pubsub, errors';
    throw new Meteor.Error(400, message);
  }
  return collectionName;
};

KadiraData._CalculateResolutionForRange = function(rangeValue) {
  var range = KadiraData.Ranges.getRange(rangeValue);
  return KadiraData.Ranges.getResolution(range);
};

KadiraData._initMongoCluster = function() {
  var MongoShardedCluster = Npm.require('mongo-sharded-cluster');
  var mongoCluster = Meteor.wrapAsync(MongoShardedCluster.initFromEnv)();

  Meteor.wrapAsync(mongoCluster.startDbSizeLookup, mongoCluster)();
  console.log("Started MongoCluster DBSizeLookup");

  return mongoCluster;
};
