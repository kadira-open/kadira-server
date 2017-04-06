var overviewFunctionsMap = {
  "kadira_Session_send": "data-send",
  "kadira_MongoDB_dataHandler": "mongo-receive",
  "kadira_Cursor_forEach": "cursor-forEach",
  "kadira_Cursor_map": "cursor-map",
  "kadira_Cursor_fetch": "cursor-fetch",
  "kadira_Cursor_count": "cursor-count",
  "kadira_Cursor_observeChanges": "cursor-observeChanges",
  "kadira_Cursor_observe": "cursor-observe",
  "kadira_Cursor_rewind": "cursor-rewind",
  "kadira_Multiplexer_sendAdds": "pubsub-initial-adds",
  "kadira_MongoConnection_insert": "mongo-insert",
  "kadira_MongoConnection_update": "mongo-update",
  "kadira_MongoConnection_remove": "mongo-remove",
  "kadira_Session_sendAdded": "pubsub-sendAdded",
  "kadira_Session_sendChanged": "pubsub-sendChanged",
  "kadira_Session_sendRemoved": "pubsub-sendRemoved",
  "kadira_Crossbar_listen": "crossbar-listen",
  "kadira_Crossbar_fire": "crossbar-fire",
  "_.extend._runInitialQuery": "oplog-initial-query",
  "proto._runQuery": "oplog-query",
  "MongoReply.parseBody": "mongo-parsing",
  "_.extend._nextObject": "mongo-receive",
  "(idle)": "Idle Time",
  "(program)": "System Time"
};

CPUProfile = function(profile, options) {
  options = options || {};
  this._removingPaths = options.removingPaths || {};

  this.profile = profile;

  // only client profile has 'timestamps' field
  // So, if 'timestamps' field exists in 'profile' object,
  // then, it's a client profile 
  if(profile.hasOwnProperty("timestamps")) {
    this.type = "client";
  } else {
    this.type = "server";
  }

  this.paths = profile.head.children;
  this.functionsMap = {};
  this.totalHitCount = 0;

  this.realFunctionsMap = {};
  this._lastId = 0;

  this.sortedFunctions = [];
  this.sortedPaths = [];
  this.overview = {};
  this.sortedOverviews = [];
};

CPUProfile.prototype.setRemovingPaths = function(pathArray) {
  var self = this;
  _.each(pathArray, function(path) {
    self._removingPaths[path] = true;
  });
};

CPUProfile.prototype.process = function() {
  var self = this;

  // remove unwated paths
  // We need to do this separately, otherwise we'll have
  // wrong path names
  var newPaths = [];
  for(var lc=0; lc<this.paths.length; lc++) {
    var path = this.paths[lc];
    if(!this._removingPaths[path.functionName]) {
      newPaths.push(path);
    }
  }
  this.paths = newPaths;

  this.paths.forEach(function(path, pathId) {
    self.totalHitCount += self._buildFunctions(path, pathId);
    path.pathId = pathId;
    self.sortedPaths.push(path);

    // convert uid map to an array
    for(var type in self.overview) {
      if(self.overview[type].paths[pathId]) {
        var uids = Object.keys(self.overview[type].paths[pathId].functions);
        self.overview[type].paths[pathId].functions = uids;
      }
    }
  });

  for(var overviewType in this.overview){
    overviewTypeInfo = this.overview[overviewType];
    overviewTypeInfo.name = overviewType;
    self.sortedOverviews.push(overviewTypeInfo);
  }

  this.sortedFunctions.sort(sortByTotalHitCount);
  this.sortedPaths.sort(sortByTotalHitCount);
  self.sortedOverviews.sort(sortByTotalHitCount);
  
  function sortByTotalHitCount(a, b) {
    return b.totalHitCount - a.totalHitCount;
  }
};

CPUProfile.prototype._buildFunctions = function(node, pathId, isIgnored) {
  var self = this;

  // assign an id for each node
  node.id = "id-" + (++this._lastId);
  this.realFunctionsMap[node.id] = node;

  var rootFunc = self._getFunction(node);
  rootFunc.totalHitCount += node.hitCount;
  rootFunc.totalHitCountByPath[pathId] =
    rootFunc.totalHitCountByPath[pathId] || 0;
  rootFunc.totalHitCountByPath[pathId] += node.hitCount;

  node.totalHitCount = node.hitCount;

  // add labeled functions and app functions to overview
  var type = overviewFunctionsMap[node.functionName];
  var packageRegex = /.*programs\/server\/packages\/(.*)\.js/;

  // process children nodes
  if(node.children) {
    var ignore = isIgnored || type;
    node.children.forEach(function(child) {
      node.totalHitCount += self._buildFunctions(child, pathId, ignore);
    });
  }

  if(isIgnored) {
    // do nothing
  } else if (type) {
    this._addOverviewItem(type, pathId, node, node.totalHitCount);
  } else if (node.url && node.url.substr(0, 4) === "app/") {
    this._addOverviewItem("app", pathId, node, node.hitCount);
  } else if (packageRegex.test(node.url)) {
    var packageName = packageRegex.exec(node.url)[1];
    this._addOverviewItem("package:"+packageName, pathId, node, node.hitCount);
  }

  return node.totalHitCount;
};

CPUProfile.prototype._getFunction = function(functionNode) {
  var key = functionNode.callUID;
  var func = this.functionsMap[key];
  if(!func) {
    this.functionsMap[key] =
      func = _.omit(functionNode, "children", "hitCount");
    func.totalHitCount = 0;
    func.totalHitCountByPath = {};
    this.sortedFunctions.push(func);
  }
  return func;
};

CPUProfile.prototype._addOverviewItem = function(type, pathId, node, hits) {
  var overview = this.overview[type];
  if(!overview) {
    this.overview[type] = {paths: {}, totalHitCount: 0};
    overview = this.overview[type];
  }
  var pathOverview = overview.paths[pathId];
  if(!pathOverview) {
    overview.paths[pathId] = {totalHitCount: 0, functions: {}};
    pathOverview = overview.paths[pathId];
  }
  overview.totalHitCount += hits;
  pathOverview.totalHitCount += hits;
  pathOverview.functions[node.callUID] = true;
  node._isLabelNode = true;
};