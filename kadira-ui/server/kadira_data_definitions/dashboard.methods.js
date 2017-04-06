KadiraData.defineMetrics("breakdown.methods", "methodsMetrics", function(args) {
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
  groupDef._id = "$value.name";
  groupDef.commonValue = {"$sum": "$value.count"};

  // build project
  projectDef.commonValue = "$commonValue";
  projectDef.sortValueTitle = "$_id";
  projectDef.id = "$_id";

  switch(args.sortBy) {
  case "count":
    groupDef.sortedValue = {"$sum": "$value." + args.sortBy};
    projectDef.sortedValue = "$sortedValue";
    break;
  default:
    calculateResTime(args.sortBy, "count");
    break;
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
  KadiraDataFilters.rateFilterForBreakdown(["count"]),
  KadiraDataFilters.roundTo(["commonValue"], 2)
]);

KadiraData.defineMetrics("timeseries.responseTimeBreakdown", "methodsMetrics",
function(args){

  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.name"] = selectedPublication;
  }

  var groupDef = {_id: {time: "$value.startTime"}};
  var projectDef = {_id: "$_id"};
  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: {_id: 1}});

  groupDef.count = {"$sum": "$value.count"};
  ["wait", "db", "http", "email", "compute", "async"].forEach(function(metric) {
    groupDef[metric] = {
      "$sum": KadiraDataHelpers.safeMultiply("$value." + metric, "$value.count")
    };
    projectDef[metric] =
      KadiraDataHelpers.divideWithZero("$" + metric, "$count", true);
  });

  return pipes;
}, [
  KadiraDataFilters.roundTo(
    ["wait", "db", "http", "email", "compute", "async"],
  2),
  KadiraDataFilters.addZeros(
    ["wait", "db", "http", "email", "compute", "async"]
  )
]);


KadiraData.defineMetrics("timeseries.throughput", "methodsMetrics",
function(args) {
  var query = args.query;

  var selectedMethod = args.selection;
  if(selectedMethod){
    query["value.name"] = selectedMethod;
  }

  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};
    groupDef.count = {"$sum": "$value.count"};
    return groupDef;
  }
}, [
  KadiraDataFilters.rateFilterForCharts(["count"]),
  KadiraDataFilters.roundTo(["count"], 2),
  KadiraDataFilters.addZeros(["count"])
]);

KadiraData.defineMetrics("timeseries.resTimeThroughput", "methodsMetrics",
function(args) {
  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication){
    query["value.name"] = selectedPublication;
  }

  var groupDef = {_id: {time: "$value.startTime"}};
  var projectDef = {_id: "$_id"};
  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: {_id: 1}});

  groupDef.count = {"$sum": "$value.count"};
  projectDef.count = "$count";

  groupDef.total =  {
    "$sum": KadiraDataHelpers.safeMultiply("$value.total", "$value.count")
  };
  projectDef.total =
    KadiraDataHelpers.divideWithZero("$total", "$count", true);

  return pipes;
}, [
  KadiraDataFilters.rateFilterForCharts(["count"]),
  KadiraDataFilters.roundTo(["count", "total"], 2),
  KadiraDataFilters.addZeros(["count", "total"])
]);
