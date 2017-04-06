KadiraData.defineMetrics("histogram.pubsub", "pubMetrics", function(args) {
  var pipes = [];
  var query = args.query;
 
  // we need to get the 1min resoution always
  query["value.res"] = "1min";
  var actualRes = KadiraData._CalculateResolutionForRange(args.range);
  var resMillis = KadiraData._ResolutionToMillis(actualRes);
  query["value.startTime"] = {
    $gte: args.time,
    $lt: new Date(args.time.getTime() + resMillis)
  };

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["value.pub"] = selectedPublication;
  }

  pipes.push({$match: args.query});
  pipes.push({$project: {
    "bin": {$subtract: ["$value.resTime", {$mod: ["$value.resTime", 100]}]},
    "subs": "$value.subs"
  }});
  pipes.push({$group: {
    _id: "$bin",
    count: {$sum: "$subs"}
  }});
  pipes.push({$sort: {"_id": 1}});

  return pipes;
});

KadiraData.defineMetrics("histogram.method", "methodsMetrics", function(args) {
  var pipes = [];
  var query = args.query;
 
  // we need to get the 1min resoution always
  query["value.res"] = "1min";
  var actualRes = KadiraData._CalculateResolutionForRange(args.range);
  var resMillis = KadiraData._ResolutionToMillis(actualRes);
  query["value.startTime"] = {
    $gte: args.time,
    $lt: new Date(args.time.getTime() + resMillis)
  };

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["value.name"] = selectedPublication;
  }

  pipes.push({$match: args.query});
  pipes.push({$project: {
    "bin": {$subtract: ["$value.total", {$mod: ["$value.total", 100]}]},
    "count": "$value.count"
  }});
  pipes.push({$group: {
    _id: "$bin",
    count: {$sum: "$count"}
  }});
  pipes.push({$sort: {"_id": 1}});

  return pipes;
});
