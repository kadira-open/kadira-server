KadiraData.defineMetrics("summary.pubsub", "pubMetrics",function(args) {
  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["value.pub"] = selectedPublication;
  }

  var pipes = [];
  var projectDef = {};
  var groupDef = {_id: null};

  groupDef.subs = {"$sum": "$value.subs"};
  projectDef.subs = "$subs";

  groupDef.resTime = {
    "$sum": KadiraDataHelpers.safeMultiply("$value.resTime", "$value.subs")
  };
  projectDef.resTime =
    KadiraDataHelpers.divideWithZero("$resTime", "$subs", true);

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});

  return pipes;
}, [
  KadiraDataFilters.divideByRange(["subs"]),
  KadiraDataFilters.roundTo(["subs"], 2),
  KadiraDataFilters.roundTo(["resTime"], 0)
]);

KadiraData.defineMetrics("summary.liveQueries", "pubMetrics",function(args) {
  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["value.pub"] = selectedPublication;
  }

  var pipes = [];
  var projectDef = {};
  var groupDef = {_id: null};

  groupDef.subs = {"$sum": "$value.subs"};
  projectDef.subs = "$subs";

  groupDef.lifeTime = {"$avg": "$value.lifeTime"}
  projectDef.lifeTime = "$lifeTime";

  groupDef.polledDocuments = {"$sum": "$value.polledDocuments"};
  projectDef.polledDocuments = "$polledDocuments";

  var liveUpdatesFields = [
    "$value.liveAddedDocuments",
    "$value.liveChangedDocuments",
    "$value.liveRemovedDocuments"
  ];
  groupDef.liveUpdates = {"$sum": {"$add": liveUpdatesFields}};
  projectDef.liveUpdates = "$liveUpdates";

  groupDef.initiallyAddedDocuments = {"$sum": "$value.initiallyAddedDocuments"};
  var allDocumentChangesFields = [
    "$value.liveAddedDocuments", "$value.liveChangedDocuments",
    "$value.liveRemovedDocuments"
  ];
  groupDef.allDocumentChanges = {"$sum": {$add: allDocumentChangesFields}}

  projectDef.updateRatio = KadiraDataHelpers.safeMultiply(
    KadiraDataHelpers.divideWithZero(
      "$allDocumentChanges", "$initiallyAddedDocuments", true),
    100
  );

  groupDef.resTime = {
    "$sum": KadiraDataHelpers.safeMultiply("$value.resTime", "$value.subs")
  };
  projectDef.resTime =
    KadiraDataHelpers.divideWithZero("$resTime", "$subs", true);

  groupDef.totalObserverHandlers = {"$sum": "$value.totalObserverHandlers"};
  groupDef.cachedObservers = {"$sum": "$value.cachedObservers"};
  projectDef.observerReuse = KadiraDataHelpers.safeMultiply(
    KadiraDataHelpers.divideWithZero(
      "$cachedObservers", "$totalObserverHandlers", true),
    100
  );

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});

  return pipes;
}, [
  KadiraDataFilters.divideByRange(["subs"]),
  KadiraDataFilters.roundTo(["observerReuse", "updateRatio"], 2),
  KadiraDataFilters.roundTo(
    ["resTime", "lifeTime", "polledDocuments", "changedDocuments"], 0)
]);

KadiraData.defineMetrics("summary.activeSubs", "pubMetrics", function(args) {
  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["value.pub"] = selectedPublication;
  }

  var pipes = [];

  var preGroupDef = {
    _id: {pub: "$value.pub", host: "$value.host"},
    activeSubs: {
      "$avg": "$value.activeSubs"
    }
  };

  var postGroupDef = {
    _id: null,
    activeSubs: {
      "$sum": "$activeSubs"
    }
  };
  var postProjectDef = {activeSubs: "$activeSubs"};

  pipes.push({$match: query});
  pipes.push({$group: preGroupDef});
  pipes.push({$group: postGroupDef});
  pipes.push({$project: postProjectDef});

  return pipes;
}, [
  KadiraDataFilters.roundTo(["activeSubs"], 2)
]);

KadiraData.defineMetrics("summary.methods", "methodsMetrics",function(args) {
  var query = args.query;

  var selectedPublication = args.selection;
  if(selectedPublication) {
    query["value.name"] = selectedPublication;
  }

  var pipes = [];
  var projectDef = {};
  var groupDef = {_id: null};

  groupDef.count = {"$sum": "$value.count"};
  projectDef.count = "$count";

  groupDef.methodResTime = {
    "$sum": KadiraDataHelpers.safeMultiply("$value.total", "$value.count")
  };
  projectDef.methodResTime =
    KadiraDataHelpers.divideWithZero("$methodResTime", "$count", true);

  groupDef.throughput = {"$sum": "$value.count"};
  projectDef.throughput = "$throughput";

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});

  return pipes;
}, [
  KadiraDataFilters.divideByRange(["throughput"]),
  KadiraDataFilters.roundTo(["throughput", "count"], 2),
  KadiraDataFilters.roundTo(["methodResTime"], 0)
]);

KadiraData.defineMetrics("summary.system", "systemMetrics", function(args) {
  var query = args.query;
  var pipes = [];
  var projectDef = {};
  var groupDef = {_id: null};

  groupDef.memory = {$avg: "$value.memory"};
  projectDef.memory = "$memory";

  groupDef.pcpu = {$avg: "$value.pcpu"};
  projectDef.pcpu = "$pcpu";

  groupDef.sessions = {$avg: "$value.sessions"};
  projectDef.sessions = "$sessions";

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  return pipes;
}, [
  KadiraDataFilters.roundTo(["memory", "pcpu"], 2),
  KadiraDataFilters.roundTo(["sessions"], 0)
]);
