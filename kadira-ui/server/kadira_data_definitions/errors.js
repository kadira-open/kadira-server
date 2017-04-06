KadiraData.defineMetrics("breakdown.errors", "errorMetrics", function(args) {
  var query = args.query;
  var pipes = [];
  var projectDef = {};
  var groupDef = {};
  var sortDef = {};

  groupDef._id = {name: "$value.name", type: "$value.type"};
  projectDef.type = "$_id.type";

  groupDef.count = {"$sum": "$value.count"};
  projectDef.count = "$count";
  if(args.errorType){
    query["value.type"] = args.errorType;
  }

  if(args.searchq) {
    var nameQuery = new RegExp(args.searchq.trim(), "i");
    query["value.name"] = nameQuery;
  }

  switch(args.sortBy) {
  case "count":
    sortDef.count = -1;
    break;
  case "lastSeenTime":
    groupDef.lastSeenTime = {"$max": "$value.startTime"};
    projectDef.lastSeenTime = "$lastSeenTime";
    sortDef.lastSeenTime = -1;
    break;
  default:
    sortDef.count = -1;
  }

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: sortDef});
  pipes.push({$limit: 50});
  return pipes;
}, [
  KadiraErrorFilters.filterErrorsByStatus()
]);

KadiraData.defineMetrics("timeseries.errors", "errorMetrics",
function(args){

  var query = args.query;

  var selectedError = args.selection;

  // start - filter by error status
  var range = args.range || 30 * 60 * 1000;
  var resolution = KadiraData._CalculateResolutionForRange(range);

  // args.searchq and args.errorType is already filtered by hbarData
  // selectedError can include "" values too
  if(selectedError !== undefined){
    query["value.name"] = selectedError;
  }
  var hbarData = 
  KadiraData.getMetrics("breakdown.errors", args, resolution, range);

  if(hbarData.length > 0) {
    query["$or"] = [];
    hbarData.forEach(function (d) {
      query["$or"].push({"value.name": d._id.name, "value.type": d._id.type});
    });
  } else {
    // empty hbar data means chart should be empty too
    query["value.name"] = null;
  }

  // end - filter by error status


  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$project: {
    _id: "$_id",
    errorCount: "$errorCount",
  }});
  pipes.push({$sort: {_id: 1}});

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};

    groupDef.errorCount = {"$sum": "$value.count"};
    return groupDef;
  }
  return pipes;
}, [
  KadiraDataFilters.addZeros(["errorCount"])
]);