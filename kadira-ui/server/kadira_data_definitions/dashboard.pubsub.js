KadiraData.defineMetrics("breakdown.pubsub", "pubMetrics", function(args) {
  var query = args.query;
  var pipes = [];
  var projectDef = {};
  var groupDef = {};
  var sortDef = {"sortedValue": -1};
  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: sortDef});
  pipes.push({$limit: 50});

  // build group
  groupDef._id = "$value.pub";
  groupDef.commonValue = {"$sum": "$value.subs"};

  // build project
  projectDef.commonValue = "$commonValue";
  projectDef.sortValueTitle = "$_id";
  projectDef.id = "$_id";

  switch(args.sortBy) {
  case "unsubs":
  case "subs":
  case "createdObservers":
  case "deletedObservers":
  case "totalObserverHandlers":
  case "cachedObservers":
    groupDef.sortedValue = {"$sum": "$value." + args.sortBy};
    projectDef.sortedValue = "$sortedValue";
    break;
  case "resTime":
    calculateResTime(args.sortBy, "subs");
    break;
  case "lifeTime":
    sortDef.sortedValue = 1;
    calculateResTime(args.sortBy, "unsubs");
    break;
  case "activeSubs":
      // we override how we group here. We need grouped by both pub and host
    groupDef._id = {pub: "$value.pub", host: "$value.host"};
    groupDef.sortedValue = {"$avg": "$value." + args.sortBy};

      // then we need to post aggregate it.
    var postGroupDef = {
      _id: "$_id.pub",
      sortedValue: {$sum: "$sortedValue"},
      commonValue: {$sum: "$commonValue"},
    };
    pipes.splice(2, 0, {$group: postGroupDef});
    projectDef.sortedValue = "$sortedValue";
    break;
  case "cacheMiss":
    calculateObserverRatio();
    sortDef.sortedValue = 1;
    break;
  case "cacheHits":
    calculateObserverRatio();
    sortDef.sortedValue = -1;
    break;
  }

  function calculateObserverRatio() {
    groupDef.total = {"$sum": "$value.totalObserverHandlers"};
    groupDef.cached = {"$sum": "$value.cachedObservers"};
    projectDef.sortedValue = KadiraDataHelpers.safeMultiply(
      KadiraDataHelpers.divideWithZero("$cached", "$total"),
      100
    );
  }

  function calculateResTime(avgValue, sampleValue) {
    groupDef.sum = {
      "$sum": KadiraDataHelpers.safeMultiply("$value." + avgValue,
        "$value." + sampleValue),
    };
    groupDef.samples = {"$sum": "$value." + sampleValue};
    projectDef.sortedValue =
      KadiraDataHelpers.divideWithZero("$sum", "$samples", true);
  }

  return pipes;
}, [
  KadiraDataFilters.rateFilterForBreakdown(["subs", "unsubs"]),
  KadiraDataFilters.roundTo(["commonValue"], 2)
]);

KadiraData.defineMetrics("timeseries.subRate", "pubMetrics", function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.pub"] = selectedPublication;
  }

  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};
    if(groupByHost) {
      groupDef._id.host = "$value.host";
    }

    groupDef.subs = {"$sum": "$value.subs"};
    return groupDef;
  }
}, [
  KadiraDataFilters.rateFilterForCharts(["subs"]),
  KadiraDataFilters.roundTo(["subs"], 2),
  KadiraDataFilters.addZeros(["subs"])
]);

KadiraData.defineMetrics("timeseries.subRateResTime", "pubMetrics",
function(args){

  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.pub"] = selectedPublication;
  }

  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$project: {
    _id: "$_id",
    resTime: KadiraDataHelpers.divideWithZero("$resTime", "$count", true),
    subs: "$count"
  }});

  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};

    groupDef.resTime = {
      "$sum": KadiraDataHelpers.safeMultiply("$value.resTime", "$value.subs")
    };
    groupDef.count = {"$sum": "$value.subs"};
    return groupDef;
  }
}, [
  KadiraDataFilters.rateFilterForCharts(["subs"]),
  KadiraDataFilters.roundTo(["resTime", "subs"], 2),
  KadiraDataFilters.addZeros(["resTime", "subs"])
]);

KadiraData.defineMetrics("timeseries.activeSubsLifeTime", "pubMetrics",
function(args){

  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.pub"] = selectedPublication;
  }
  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$group: buildPostGroup()});
  pipes.push({$project: {
    _id: "$_id",
    activeSubs: "$activeSubs",
    lifeTime: KadiraDataHelpers.divideWithZero("$lifeTime", "$count", true)
  }});
  pipes.push({$sort: {_id: 1}});

  function buildGroup() {
    var groupId = {
      time: "$value.startTime",
      host: "$value.host",
      pub: "$value.pub"
    };
    var groupDef = {_id: groupId};

    groupDef.activeSubs = {"$avg": "$value.activeSubs"};
    groupDef.lifeTime = {"$sum": "$value.lifeTime"};
    var condition = [{"$eq": ["$value.lifeTime", 0]}, 0, 1];
    groupDef.count = {"$sum": {"$cond": condition}};
    return groupDef;
  }

  function buildPostGroup() {
    var groupDef = {_id: {time: "$_id.time"}};

    groupDef.activeSubs = {"$sum": "$activeSubs"};
    groupDef.count = {"$sum": "$count"};
    groupDef.lifeTime = {"$sum": "$lifeTime"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo(["activeSubs", "lifeTime"], 2),
  KadiraDataFilters.addZeros(["activeSubs", "lifeTime"])
]);

KadiraData.defineMetrics("timeseries.createdDeletedObservers", "pubMetrics",
function(args) {

  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.pub"] = selectedPublication;
  }
  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};

    groupDef.createdObservers = {"$sum": "$value.createdObservers"};
    groupDef.deletedObservers = {"$sum": "$value.deletedObservers"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo(["createdObservers", "createdObservers"], 2),
  KadiraDataFilters.addZeros(["createdObservers", "deletedObservers"])
]);


KadiraData.defineMetrics("timeseries.totalReusedObservers", "pubMetrics",
function(args) {

  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.pub"] = selectedPublication;
  }
  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};

    groupDef.totalObserverHandlers = {"$sum": "$value.totalObserverHandlers"};
    groupDef.cachedObservers = {"$sum": "$value.cachedObservers"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo(["totalObserverHandlers", "cachedObservers"], 2),
  KadiraDataFilters.addZeros(["totalObserverHandlers", "cachedObservers"])
]);

KadiraData.defineMetrics("timeseries.subUnsubRates", "pubMetrics",
function(args) {

  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.pub"] = selectedPublication;
  }
  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};

    groupDef.subs = {"$sum": "$value.subs"};
    groupDef.unsubs = {"$sum": "$value.unsubs"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.rateFilterForCharts(["subs", "unsubs"]),
  KadiraDataFilters.roundTo(["subs", "unsubs"], 2),
  KadiraDataFilters.addZeros(["subs", "unsubs"])
]);
