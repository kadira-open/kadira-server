KadiraData._metricDefinitions = {};
KadiraData._traceDefinitions = {};
KadiraData.mongoCluster = KadiraData._initMongoCluster();

KadiraData._metricsPollInterval = {
  "1min": 1000 * 30,
  "30min": 1000 * 60 * 10,
  "3hour": 1000 * 60 * 30
};
KadiraData._transportCollection = 'kadira-data-collection';

KadiraData.defineMetrics =
function define(dataKey, collection, pipeHandler, filters) {
  KadiraData._metricDefinitions[dataKey] = {
    collection: collection,
    pipeHandler: pipeHandler,
    filters: filters || []
  };
};

KadiraData.defineTraces =
function define(dataKey, collection, pipeHandler, filters) {
  KadiraData._traceDefinitions[dataKey] = {
    collection: collection,
    pipeHandler: pipeHandler,
    filters: filters || []
  };
};

KadiraData.getMetrics = function(dataKey, args, resolution, range) {
  var definition = KadiraData._metricDefinitions[dataKey];
  if(!definition) {
    var message = 'There is no such publish definition for dataKey: ' + dataKey;
    throw new Meteor.Error('404', message);
  }
  var query = {
    'value.res': resolution,
    // args.appId is now an array
    'value.appId': {$in: args.appId}
  };

  if(args.realtime) {
    query['value.startTime'] =
      KadiraData._CalulateRealtimeDateRange(resolution, range);
  } else {
    query['value.startTime'] =
      KadiraData._CalculateDateRange(args.time, range);
  }

  if(args.host) {
    query['value.host'] = args.host;
  }

  var newArgs = _.extend(_.clone(args), {query: query});
  var pipes = definition.pipeHandler(newArgs);
  var dbConn = KadiraData.getConnectionForApp(args.appId[0]);
  var coll = dbConn.collection(definition.collection);
  var data = Meteor.wrapAsync(coll.aggregate, coll)(pipes);

  // apply filters
  definition.filters.forEach(function(filter) {
    data = filter(_.clone(data), newArgs);
  });
  return data;
};

KadiraData.getConnectionForApp = function(appId) {
  //XXX: use findFaster for this
  var app = Apps.findOne(appId);
  if(!app) {
    throw new Error("No such app: " + appId);
  }

  var connection = KadiraData.mongoCluster.getConnection(app.shard);
  return connection;
};
