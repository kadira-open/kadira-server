var SORT_OPTIONS = [
  {
    value: "overview",
    label: "Overview",
    type: "server"
  }, {
    value: "costlyFunction",
    label: "Costly Functions",
    type: "any"
  }, {
    value: "costlyPaths",
    label: "Costly Entrypoints",
    type: "any"
  }
];

var SORT_TYPES = {
  "overview" : "overviewType",
  "costlyFunction": "method",
  "costlyPaths": "pathId"
};

var component = FlowComponents.define("profileAnalyser", function(props) {
  var self = this;
  this.set("isProfileLoading", true);
  this.sortOptions = SORT_OPTIONS;

  this.onRendered(function() {
    this.autorun(function() {
      var profile = props.profile();
      if(profile) {
        // this third parameter indicate flow to fire this value right away
        // it does not do anykind of cloning and equality checks
        // if it does, then that's a waste of CPU time.
        // since this is a pretty big blob
        this.set("profile", profile, true);
        this.profile = profile;

        this.profileType = profile.type;
        this.sortOptions = getSortOptions(this.profileType);

        var metric = FlowRouter.getQueryParam("metric") || 
          this.sortOptions[0].value;
        FlowRouter.setQueryParams({"metric": metric});

        self.setGraphHeights();
      }
    });

    this.autorun(function() {
      var profile = this.get("profile");
      if(profile) {
        this.set("isProfileLoading", false);
        this.renderGraphs(profile);
      }
    });

    this.autorun(function() {
      var profile = this.get("profile");
      if(profile) {
        var sortedValueType = this.get("hbarSortedItem");
        this.loadHbarData(profile, sortedValueType);
      }
    });

    this.resizeWithWindowHeightChange();
  });

  this.onDestroyed(function() {
    FlowRouter.setQueryParams({
      metric: null,
      method: null, 
      pathId: null, 
      overviewType: null
    });
  });
});

component.extend(Mixins.UiHelpers);

component.prototype.renderGraphs = function(profile) {
  var selectedMethod = FlowRouter.getQueryParam("method");
  var selectedPath = FlowRouter.getQueryParam("pathId");
  var selectedOverview = FlowRouter.getQueryParam("overviewType");

  //get selected option
  var sortedValueType = this.get("hbarSortedItem");
  if(sortedValueType === "costlyFunction"){
    this.renderFlameGraphMethod(profile, selectedMethod);
  } else if(sortedValueType === "costlyPaths"){
    this.renderFlameGraphPath(profile, selectedPath);
  } else if(sortedValueType === "overview"){
    this.renderFlameGraphOverview(profile, selectedOverview);
  }
};

component.prototype.loadHbarData = function(profile, sortedValueType) {
  var methodsData;
  var totalHitCount = profile.totalHitCount || 1;
  if(sortedValueType === "costlyFunction"){
    if(this.costlyFunctionMethodsData) {
      methodsData = this.costlyFunctionMethodsData;
    } else {
      methodsData =
        this.getDataArr(profile.sortedFunctions, totalHitCount, "callUID");
      this.costlyFunctionMethodsData = methodsData;
    }
  } else if(sortedValueType === "costlyPaths"){
    if(this.costlyPathsMethodsData) {
      methodsData = this.costlyPathsMethodsData;
    } else {
      methodsData = this.getDataArr(profile.sortedPaths, totalHitCount);
      this.costlyPathsMethodsData = methodsData;
    }

  } else if(sortedValueType === "overview"){
    if(this.overviewMethodsData) {
      methodsData = this.overviewMethodsData;
    } else {
      methodsData =
      this.getDataArr(profile.sortedOverviews, totalHitCount, null, "name");
      this.overviewMethodsData = methodsData;
    }
  }
  this.set("hbarChartData", methodsData);
};

component.prototype.setGraphHeights = function() {
  var topOffset = this.$("#pf-breakdown-chart").offset().top || 200;
  var height = $(window).height() - topOffset - 200;
  this.set("flameviewerHeight", height);

  var breakdownHeight = $(window).height() - topOffset - 70;
  this.set("hbarHeight", breakdownHeight);
};

component.state.functionDetails = function() {
  var profile = this.profile;
  var node = this.get("hoveredNode") || this.get("selectedNode");

  if(node) {
    var totalHitCount = profile.totalHitCount;
    if(node.hitCount === undefined) {
      node.hitCount = node.totalHitCount;
    }
    var selfUsage = ((node.hitCount/totalHitCount) * 100).toFixed(2);
    var totalUsage = ((node.totalHitCount/totalHitCount) * 100).toFixed(2);

    return {
      selfUsage: selfUsage,
      totalUsage: totalUsage,
      functionName: node.functionName,
      fileName: this.cleanUpUrl(node.url),
      lineNumber: node.lineNumber
    };
  }
};

component.action.onClick = function(id, node) {
  this.set("selectedFunctions", [id]);
  this.set("selectedNode", node);
};

component.action.onHover = function(id, node) {
  this.set("hoveredNode", node);
};

component.action.onChartLeave = function() {
  this.set("hoveredNode", null);
};

component.state.hBarsortOptions = function() {
  if(this.profile && this.profileType && this.sortOptions) {
    return this.sortOptions;
  }
  return SORT_OPTIONS;
};

component.state.pieChartData = function() {
  var methodsData = this.get("hbarChartData") || [];
  var pieChartData = {};
  var counter = {};
  var totalCount = 0;
  methodsData.forEach(function (item) {
    var label = item.sortedValueTitle;
    counter[label] = counter[label] || 1;
    var i = counter[label];

    if(i === 1){
      pieChartData[label] = item.sortedValuePrettified;
    } else if(i === 2){
      pieChartData[label + 1] = pieChartData[label];
      delete pieChartData[label];
      pieChartData[label + 2] = item.sortedValuePrettified;
    } else if(i > 2){
      pieChartData[label + i] = item.sortedValuePrettified;
    }
    totalCount += item.sortedValuePrettified;
    counter[label]++;
  });

  pieChartData["Other"] = 100 - totalCount;

  return pieChartData;
};

component.action.onHarbarSelect = function(id) {
  var sortedValueType = this.get("hbarSortedItem");
  var paramName = SORT_TYPES[sortedValueType];
  var params = {};
  params[paramName] = id;

  FlowRouter.setQueryParams(params);
};

component.action.onHarbarSortChanged = function(metric) {
  var queryParams = {};
  for(var k in SORT_TYPES) {
    if(metric === k) {
      queryParams["metric"] = metric;
    } else {
      queryParams[SORT_TYPES[k]] = null;
    }
  }
  FlowRouter.setQueryParams(queryParams);
};

component.action.selectPath = function(pathId) {
  this.set("currentPath", pathId);
};

component.state.hbarSelectedItem = function(){
  var sort = this.get("hbarSortedItem");
  var paramKey = SORT_TYPES[sort];
  var selectedItem = FlowRouter.getQueryParam(paramKey);
  return selectedItem;
};

component.state.isHbarItemSelected = function() {
  return !!this.get("hbarSelectedItem");
};

component.state.hbarSortedItem = function() {
  var hbarSortedItem = this.sortOptions[0].value;
  return FlowRouter.getQueryParam("metric") || hbarSortedItem;
};

component.state.showEntrypoints = function() {
  return this.get("hbarSortedItem") === "costlyFunction";
};

component.prototype.getDataArr =
function(sortedData, totalHitCount, idAttr, titleAttr) {

  titleAttr = titleAttr || "functionName";
  var length = sortedData.length;
  length  = length > 30 ? 30 : length;
  var methodsData = [];
  for (var i = 0; i < length; i++) {
    var md = sortedData[i];
    var pSortedValue = Math.round((md.totalHitCount / totalHitCount) * 100);
    var id = idAttr ? md[idAttr] : i;
    var title = i18n("tools.labels."+ md[titleAttr])|| md[titleAttr];
    var methodData = {
      sortedValueTitle: title,
      sortedValuePrettified: pSortedValue,
      pSortedValue: pSortedValue,
      id: id
    };
    methodsData.push(methodData);
  }
  return methodsData;
};

component.prototype.renderFlameGraphMethod = function(profile, selectedFunc) {
  if(selectedFunc){
    var cpuPaths = this.getPathsArr(profile, selectedFunc);
    this.set("cpuPaths", cpuPaths);
    var selectedNode = profile.functionsMap[selectedFunc];
    this.set("currentPath", cpuPaths[0].path);
    this.set("selectedNode", selectedNode);
    this.set("selectedFunctions", [selectedFunc]);
  }
};

component.prototype.renderFlameGraphPath = function(profile, selectedPath) {
  if(selectedPath) {
    var sortedPath = profile.sortedPaths[selectedPath];
    this.set("currentPath", sortedPath.pathId);
    this.set("selectedFunctions", [sortedPath.callUID]);
  }
};

component.prototype.renderFlameGraphOverview =
function(profile, selectedOverview) {

  if(selectedOverview){
    var pathsArr = this.getOverviewPathsArr(profile, selectedOverview);
    this.set("cpuPaths", pathsArr);
    this.set("currentPath", pathsArr[0].path);
    var overviewTypeData = profile.sortedOverviews[selectedOverview];

    var functions = overviewTypeData.paths[pathsArr[0].path].functions;
    this.set("selectedFunctions", functions);
  }
};

component.prototype.getPathsArr = function(profile, selectedFunction) {
  profile.functionsMap = profile.functionsMap || {};
  var paths = {};
  paths = profile.functionsMap[selectedFunction].totalHitCountByPath;

  var totalHits = 0;
  _.each(paths, function(hits){
    totalHits += hits;
  });

  var pathsArr = [];
  for(var path in paths){
    var hits = paths[path];
    if(hits > 0) {
      var pValue = Math.round((paths[path] / totalHits) * 100);
      pathsArr.push({path: path, pValue: pValue});
    } else if(hits === 0) {
      pathsArr.push({path: path, pValue: 0});
    }
  }

  pathsArr = _.sortBy(pathsArr, function(item){ return 1/item.pValue; });
  return pathsArr;
};

component.prototype.getOverviewPathsArr = function(profile, selectedOverview){
  var overviewTypeData = profile.sortedOverviews[selectedOverview];
  var totalHits = 0;
  _.each(overviewTypeData.paths, function(pathInfo){
    totalHits += pathInfo.totalHitCount;
  });

  var pathsArr = [];
  for(var path in overviewTypeData.paths){
    var hits = overviewTypeData.paths[path].totalHitCount;
    if(hits){
      var pValue = Math.round((hits / totalHits) * 100);
      pathsArr.push({path: path, pValue: pValue});
    } else if(hits === 0 ){
      pathsArr.push({path: path, pValue: 0});
    }
  }
  pathsArr = _.sortBy(pathsArr, function(item){ return 1/item.pValue; });
  return pathsArr;
};

component.prototype.cleanUpUrl = function(filename) {
  if(filename) {
    return filename.replace(/.*programs\/server\//, "");
  } else {
    return filename;
  }
};

component.prototype.resizeWithWindowHeightChange = function() {
  var self = this;
  var resizeFn = function() {
    self.setGraphHeights();
  };

  $(window).on("resize", resizeFn);
  self.onDestroyed(function() {
    $(window).off("resize", resizeFn);
  });
};

function getSortOptions(profileType) {
  var sortOptions = [];

  _.each(SORT_OPTIONS, function(e) {
    if((e.type === "any") || (e.type === profileType)) {
      sortOptions.push(e);
    }
  });

  return sortOptions;
}