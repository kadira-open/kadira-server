if(typeof PROFILE == 'undefined') {
  throw new Error('PROFILE expected');
}

var Log = {profile: PROFILE.name};

var sourceCollection = (PROFILE.resolution)? PROVIDER.collection: PROVIDER.rawCollection;
var destCollection = PROVIDER.collection;
var scope = PROVIDER.scope;
scope.PROFILE = PROFILE;

var query = {
  'value.res': PROFILE.resolution || null,
  // this is to trick MongoDB and use the single compound index
  // for queries with appId and not
  // in this case, we need to get all the apps
  'value.appId': {$ne: "c90153bf-147d-41e5-86e7-584872a61d2b"}
};

// We must be able to specify time intervals for completing the old
// rma jobs.
//This check will extract and set the time interval from env vars if set
begin = timeRound(parseFloat(ENV.START_TIME), PROFILE);
Log.startedAt = new Date(timeRound(parseFloat(ENV.END_TIME), PROFILE));

query['value.startTime'] = {
    $gte: new Date(begin),
    $lt: Log.startedAt
};

//applying map reduce
var options = {
  query: query,
  out: {'merge': destCollection},
  sort: {
    "value.res": 1,
    "value.startTime": 1
  },
  finalize: PROVIDER.finalize,
  scope: scope,
  jsMode: true
};

printjson(query);

print("  Using local MR");
MapReduce(db, sourceCollection, destCollection, PROVIDER.map, PROVIDER.reduce, options);
