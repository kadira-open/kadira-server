KadiraData.defineMetrics("breakdown.liveQueries", "pubMetrics", function(args) {
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
  case "subs":
  case "polledDocuments":
  case "initiallyAddedDocuments":
  case "liveAddedDocuments":
  case "liveChangedDocuments":
  case "liveRemovedDocuments":
    groupDef.sortedValue = {"$sum": "$value." + args.sortBy};
    projectDef.sortedValue = "$sortedValue";
    break;
  case "totalObserverChanges":
    var fields = [
      "$value.initiallyAddedDocuments",
      "$value.liveAddedDocuments",
      "$value.liveChangedDocuments",
      "$value.liveRemovedDocuments"
    ];
    groupDef.sortedValue = {"$sum": {$add: fields}}
    projectDef.sortedValue = "$sortedValue";
    break;
  case "totalLiveUpdates":
    var fields = [
      "$value.liveAddedDocuments",
      "$value.liveChangedDocuments",
      "$value.liveRemovedDocuments"
    ];
    groupDef.sortedValue = {"$sum": {$add: fields}}
    projectDef.sortedValue = "$sortedValue";
    break;
  case "oplogNotifications":
    var fields = [
      "$value.oplogDeletedDocuments",
      "$value.oplogUpdatedDocuments",
      "$value.oplogInsertedDocuments"
    ];
    groupDef.sortedValue = {"$sum": {$add: fields}}
    projectDef.sortedValue = "$sortedValue";
    break;
  case "updateRatio.low":
  case "updateRatio.high":
    groupDef.initiallyAddedDocuments = {
      "$sum": "$value.initiallyAddedDocuments"
    };
    var allDocumentChangesFields = [
      "$value.liveAddedDocuments", "$value.liveChangedDocuments",
      "$value.liveRemovedDocuments"
    ];
    groupDef.allDocumentChanges = {"$sum": {$add: allDocumentChangesFields}}

    projectDef.sortedValue = KadiraDataHelpers.safeMultiply(
      KadiraDataHelpers.divideWithZero(
        "$allDocumentChanges", "$initiallyAddedDocuments", true),
      100
    );

    sortDef.sortedValue = args.sortBy === "updateRatio.low"? 1 : -1;
    break;
  case "observerReuse.low":
  case "observerReuse.high":
    groupDef.totalObserverHandlers = {"$sum": "$value.totalObserverHandlers"};
    groupDef.cachedObservers = {"$sum": "$value.cachedObservers"};
    projectDef.sortedValue = KadiraDataHelpers.safeMultiply(
      KadiraDataHelpers.divideWithZero(
        "$cachedObservers", "$totalObserverHandlers"),
      100
    );

    sortDef.sortedValue = args.sortBy === "observerReuse.low"? 1 : -1;
    break;
  }

  return pipes;
}, [
  KadiraDataFilters.rateFilterForBreakdown(["subs"]),
  KadiraDataFilters.roundTo(["commonValue"], 2)
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
    activeSubs: "$activeSubs"
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
    return groupDef;
  }

  function buildPostGroup() {
    var groupDef = {_id: {time: "$_id.time"}};

    groupDef.activeSubs = {"$sum": "$activeSubs"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo(["activeSubs"], 2),
  KadiraDataFilters.addZeros(["activeSubs"])
]);

KadiraData.defineMetrics("timeseries.documentsChangedCount", "pubMetrics",
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

  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};
    if(groupByHost) {
      groupDef._id.host = "$value.host";
    }

    groupDef.resTime =
      {"$sum": KadiraDataHelpers.safeMultiply("$value.resTime", "$value.subs")};
    groupDef.count = {"$sum": "$value.subs"};
    return groupDef;
  }
}, [

]);

KadiraData.defineMetrics("timeseries.polledDocuments", "pubMetrics",
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
  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {_id: {time: "$value.startTime"}};
    if(groupByHost) {
      groupDef._id.host = "$value.host";
    }

    groupDef.polledDocuments = {"$sum": "$value.polledDocuments"};
    return groupDef;
  }
}, [
  KadiraDataFilters.roundTo(["polledDocuments"], 2),
  KadiraDataFilters.addZeros(["polledDocuments"])
]);

KadiraData.defineMetrics("timeseries.oplogNotifications", "pubMetrics",
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

    groupDef.oplogInsertedDocuments = {"$sum": "$value.oplogInsertedDocuments"};
    groupDef.oplogUpdatedDocuments = {"$sum": "$value.oplogUpdatedDocuments"};
    groupDef.oplogDeletedDocuments = {"$sum": "$value.oplogDeletedDocuments"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo([
    "oplogInsertedDocuments", "oplogUpdatedDocuments", "oplogDeletedDocuments"
  ], 2),
  KadiraDataFilters.addZeros([
    "oplogInsertedDocuments", "oplogUpdatedDocuments", "oplogDeletedDocuments"
  ])
]);

KadiraData.defineMetrics("timeseries.liveUpdates", "pubMetrics",
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

    groupDef.initiallyAddedDocuments = {
      "$sum": "$value.initiallyAddedDocuments"
    };
    groupDef.liveAddedDocuments = {"$sum": "$value.liveAddedDocuments"};
    groupDef.liveChangedDocuments = {"$sum": "$value.liveChangedDocuments"};
    groupDef.liveRemovedDocuments = {"$sum": "$value.liveRemovedDocuments"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo([
    "initiallyAddedDocuments", "liveAddedDocuments",
    "liveChangedDocuments", "liveRemovedDocuments"
  ], 2),
  KadiraDataFilters.addZeros([
    "initiallyAddedDocuments", "liveAddedDocuments",
    "liveChangedDocuments", "liveRemovedDocuments"
  ])
]);

KadiraData.defineMetrics("timeseries.observerLifeTime", "pubMetrics",
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
    observerLifetime: KadiraDataHelpers.divideWithZero(
      "$observerLifetime", "$count", true)
  }});
  pipes.push({$sort: {_id: 1}});

  function buildGroup() {
    var groupId = {
      time: "$value.startTime"
    };
    var groupDef = {_id: groupId};

    groupDef.observerLifetime = {"$sum": "$value.observerLifetime"};
    var condition = [{"$eq": ["$value.observerLifetime", 0]}, 0, 1];
    groupDef.count = {"$sum": {"$cond": condition}};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo(["observerLifetime"], 2),
  KadiraDataFilters.addZeros(["observerLifetime"])
]);

KadiraData.defineMetrics("timeseries.activeSubs", "pubMetrics",
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
    return groupDef;
  }

  function buildPostGroup() {
    var groupDef = {_id: {time: "$_id.time"}};

    groupDef.activeSubs = {"$sum": "$activeSubs"};
    return groupDef;
  }

  return pipes;

}, [
  KadiraDataFilters.roundTo(["activeSubs"], 2),
  KadiraDataFilters.addZeros(["activeSubs"])
]);
