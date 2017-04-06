KadiraData.defineTraces("traces.pubsubList", "pubTraces", function(args) {
  var limit = args.limit || 5;
  var pipes = [];
  var query = args.query;

  var sortPipe = {"totalValue": -1};

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["name"] = selectedPublication;
  }

  if(args.from >= 0) {
    query["totalValue"] = query["totalValue"] || {};
    query["totalValue"]["$gte"] = args.from;
    sortPipe["totalValue"] = 1;
  }

  if(args.to) {
    query["totalValue"] = query["totalValue"] || {};
    query["totalValue"]["$lt"] = args.to;
  }

  pipes.push({$match: args.query});
  pipes.push({$sort: sortPipe});
  pipes.push({$limit: limit});
  pipes.push({$project: {
    _id: "$_id",
    host: "$host",
    name: "$name",
    type: "$type",
    errored: "$errored",
    totalValue: "$totalValue",
    startTime: "$startTime"
  }});

  return pipes;
});

KadiraData.defineTraces("traces.pubsubSingle", "pubTraces", function(args) {
  KadiraDataHelpers.removeExpireFlag("pubTraces",
    args.query.appId, args.query._id);

  var pipes = [];

  pipes.push({$match: args.query});
  pipes.push({$limit: 1});
  return pipes;
}, [KadiraDataFilters.decriptTrace]);

KadiraData.defineTraces("traces.methodsList", "methodTraces", function(args) {
  var limit = args.limit || 5;
  var pipes = [];
  var query = args.query;

  var sortPipe = {"totalValue": -1};

  var selectedMethod = args.selection;
  if(selectedMethod) {
    query["name"] = selectedMethod;
  }

  if(args.from >= 0) {
    query["totalValue"] = query["totalValue"] || {};
    query["totalValue"]["$gte"] = args.from;
    sortPipe["totalValue"] = 1;
  }

  if(args.to) {
    query["totalValue"] = query["totalValue"] || {};
    query["totalValue"]["$lt"] = args.to;
  }

  pipes.push({$match: args.query});
  pipes.push({$sort: sortPipe});
  pipes.push({$limit: limit});
  pipes.push({$project: {
    _id: "$_id",
    host: "$host",
    name: "$name",
    type: "$type",
    errored: "$errored",
    totalValue: "$totalValue",
    startTime: "$startTime"
  }});

  return pipes;
});

KadiraData.defineTraces("traces.methodsSingle", "methodTraces", function(args) {
  KadiraDataHelpers.removeExpireFlag("methodTraces",
    args.query.appId, args.query._id);

  var pipes = [];

  pipes.push({$match: args.query});
  pipes.push({$limit: 1});

  return pipes;
}, [KadiraDataFilters.decriptTrace]);


KadiraData.defineTraces("traces.errorsSingle", "errorTraces", function(args) {
  KadiraDataHelpers.removeExpireFlag("errorTraces",
    args.query.appId, args.query._id);

  var pipes = [];

  pipes.push({$match: args.query});
  pipes.push({$limit: 1});

  return pipes;
}, [KadiraDataFilters.decriptTrace]);

KadiraData.defineTraces("traces.errorsList", "errorTraces", function(args) {
  var limit = args.limit || 20;
  var pipes = [];
  var query = args.query;
  var groupDef = {};
  var projectDef = {};

  var selectedError = args.selection;
  if(args.searchq) {
    var nameQuery = new RegExp(args.searchq.trim(), "i");
    query["name"] = nameQuery;
  }

  // selectedError can include "" values too
  if(selectedError !== undefined){
    query["name"] = selectedError;
  }

  if(args.errorType){
    query["type"] = args.errorType;
  }


  groupDef._id = {name: "$name", type: "$type"};
  groupDef.values = {$push: {id: "$_id", time: "$startTime"}};

  projectDef.name = "$_id.name";
  projectDef.type = "$_id.type";
  projectDef.samples = "$values";


  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$limit: limit});

  return pipes;
}, [
  KadiraDataFilters.convertObjectToId,
  KadiraDataFilters.limitSamples(5)
]);


KadiraData.defineTraces("traces.traceSample", "errorTraces", function(args) {
  var pipes = [];
  var query = args.query;

  var range = args.range || 30 * 60 * 1000;
  var resolution = KadiraData._CalculateResolutionForRange(range);

  if(args.realtime) {
    query.startTime =
      KadiraData._CalulateRealtimeDateRange(resolution, range);
  } else {
    query.startTime =
      KadiraData._CalculateDateRange(args.time, range);
  }

  var selectedError = args.selection;
  if(args.searchq) {
    var nameQuery = new RegExp(args.searchq.trim(), "i");
    query["name"] = nameQuery;
  }

  // selectedError can include "" values too
  if(selectedError !== undefined){
    query["name"] = selectedError;
  }

  if(args.errorType){
    query["type"] = args.errorType;
  }

  pipes.push({$match: query});
  pipes.push({$sort: {startTime: -1}});
  pipes.push({$limit: 1});
  return pipes;
});
