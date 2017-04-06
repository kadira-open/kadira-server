KadiraData.defineMetrics("timeseries.memory", "systemMetrics", function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

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

    groupDef.memory = {"$avg": "$value.memory"};
    return groupDef;
  }
}, [
  KadiraDataFilters.roundTo(["memory"], 2),
  KadiraDataFilters.addZeros(["memory"])
]);

KadiraData.defineMetrics("timeseries.pcpu", "systemMetrics", function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

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

    groupDef.pcpu = {"$avg": "$value.pcpu"};
    return groupDef;
  }
}, [
  KadiraDataFilters.toPct(2),
  KadiraDataFilters.addZeros(["pcpu"])
]);

KadiraData.defineMetrics("timeseries.pubsubResTime", "pubMetrics",
function(args) {
  var groupByHost = args.groupByHost;
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
    resTime: KadiraDataHelpers.divideWithZero("$resTime", "$count", true)
  }});

  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};
    if(groupByHost) {
      groupDef._id.host = "$value.host";
    }

    groupDef.resTime = {
      "$sum": KadiraDataHelpers.safeMultiply("$value.resTime", "$value.subs")
    };
    groupDef.count = {"$sum": "$value.subs"};
    return groupDef;
  }
}, [
  KadiraDataFilters.roundTo(["resTime"], 2),
  KadiraDataFilters.addZeros(["resTime"])
]);

KadiraData.defineMetrics("timeseries.methodResTime", "methodsMetrics",
function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$project: {
    _id: "$_id",
    resTime: KadiraDataHelpers.divideWithZero("$resTime", "$count", true)
  }});
  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};
    if(groupByHost) {
      groupDef._id.host = "$value.host";
    }

    groupDef.resTime = {
      "$sum": KadiraDataHelpers.safeMultiply("$value.total", "$value.count")
    };
    groupDef.count = {"$sum": "$value.count"};
    return groupDef;
  }
}, [
  KadiraDataFilters.roundTo(["resTime"], 2),
  KadiraDataFilters.addZeros(["resTime"])
]);

KadiraData.defineMetrics("timeseries.sessions", "systemMetrics",
function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

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

    groupDef.sessions = {"$sum": "$value.sessions"};
    return groupDef;
  }
}, [
  KadiraDataFilters.roundTo(["sessions"], 0),
  KadiraDataFilters.addZeros(["sessions"])
]);

KadiraData.defineMetrics("timeseries.createdObservers", "pubMetrics",
function(args) {
  var groupByHost = args.groupByHost;
  var query = args.query;

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

    groupDef.createdObservers = {"$sum": "$value.createdObservers"};
    return groupDef;
  }
}, [
  KadiraDataFilters.roundTo(["createdObservers"], 0),
  KadiraDataFilters.addZeros(["createdObservers"])
]);
