Meteor.methods({
  'kadiraData.fetchTraces': function(dataKey, args) {
    check(dataKey, String);
    check(args, Object);
    this.unblock();

    KadiraData._authorize(this.userId, dataKey, args);

    var definition = KadiraData._traceDefinitions[dataKey];
    if(!definition) {
      var message =
        'There is no such traceList definition for dataKey: ' + dataKey;
      throw new Meteor.Error('404', message);
    }

    var query = {};
    if(args.range) {
      // normal list query
      query = _.pick(args, 'appId', 'name', 'host');
      query.appId = {$in: query.appId};
      var range = args.range || 60 * 60 * 1000;
      var resolution = KadiraData._CalculateResolutionForRange(range);
      var resInMillis = KadiraData._ResolutionToMillis(resolution);
      query.startTime = {
        $gte: args.time,
        $lt: new Date(args.time.getTime() + resInMillis)
      };
    } else if(args.query) {
      // directly fetching a single object
      query = args.query
    }

    var newArgs = _.extend(_.clone(args), {query: query});
    var pipes = definition.pipeHandler(newArgs);
    // For traces it's possible to have appId as null
    // That's for the old traces. In this case, we should give them the
    // first shard (which is one)
    var appId = (args.appId)? args.appId[0] : null;
    if(!appId) {
      var dbConn = KadiraData.mongoCluster.getConnection("one");
    } else {
      var dbConn = KadiraData.getConnectionForApp(appId);
    }
    var coll = dbConn.collection(definition.collection);
    var data = Meteor.wrapAsync(coll.aggregate, coll)(pipes);

    definition.filters.forEach(function(filter) {
      data = filter(_.clone(data));
    });

    return data;
  }
});
