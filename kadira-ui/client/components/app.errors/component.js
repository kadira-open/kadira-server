var errorMetaSubs = new SubsManager({
  // It's very important to have this a big number
  // otherwise subscriptions might loss before every using
  // (because we will have more errors in a single view)
  cacheLimit: 500,
  cacheExpire: 10
});

var component = FlowComponents.define("app.errors", function(props) {
  this.props = props;
  var sorts = this.hbarSortOptions();
  this.set("hbarSortOptions", sorts);

  this.autorun(function() {
    var args = this.getHbarArgs(sorts);
    this.kdFindMetrics("breakdown", "breakdown.errors", args);
  });

  this.onRendered(function() {
    this.initAffix();
  });

  this.autorun(function() {
    //calculate hbar height on data arrived
    this.get("hbarChartData");

    var self = this;
    Meteor.defer(function() {
      self.fixHbarWidth();
      self.fixHbarHeight();
    });

  });

  this.onDestroyed(function() {
    //remove  window resize listeners on component destroyed
    $(window).off("resize", this.fixWidthHandler);
    $(window).off("resize", this.fixHeightHandler);
  });

  this.autorun(function() {
    // check for permissions if user is using status feature
    var showIgnored = this.get("showIgnored");
    var status = FlowRouter.getQueryParam("status");
    if(showIgnored || status) {
      this.checkPermissionsForStatus();
    }
  });

  // Invoking subscriptions for the error messages
  // We need to do this seperate from the hBar data fetching logic
  // If we do it we'll have somekind of loops
  this.autorun(function() {
    var appId = FlowRouter.getParam("appId");
    var data = this.kdMetrics("breakdown").fetch() || [];
    data.forEach(function(d) {
      errorMetaSubs.subscribe("errorsMeta.single", appId, d._id.name, d.type);
    });
  });
});

component.prototype.getHbarArgs = function(sorts) {
  // cannot use extraArgs state here,
  // because we create a dependancy for hbar selection.
  var args = this.getArgs(this.props);
  
  var sortBy = this.getSortedMetric(sorts);

  this.set("hbarSortedItem", sortBy);

  args.sortBy = sortBy;

  var errorType = FlowRouter.getQueryParam("traceType");
  if(errorType) {
    args.errorType = errorType;
  }

  var searchq = FlowRouter.getQueryParam("searchq");
  if(searchq){
    args.searchq = searchq;
  }

  args.status = this.get("currentStatus");

  var showIgnored = FlowRouter.getQueryParam("showIgnored");
  if(showIgnored && showIgnored === "true"){
    args.showIgnored = true;
  } else {
    args.showIgnored = false;
  }

  // remove host param from args
  // no need to filter by host here.
  delete args.host;

  return args;
};

component.prototype.hbarSortOptions = function() {
  var BREAKDOWN_SORT_TYPES = [
    {
      value: "count",
      label: i18n("dashboard.errors.count"),
      formatter: function(value) { return value;}
    },
    {
      value: "lastSeenTime",
      label: i18n("dashboard.errors.last_seen"),
      formatter: function(value) { return value;}
    }
  ];
  return BREAKDOWN_SORT_TYPES;
};

component.state.isInLiveMode = function() {
  return !FlowRouter.getQueryParam("date");
};

component.state.hbarChartData = function() {
  var self = this;
  var data = this.kdMetrics("breakdown").fetch() || [];

  // check the ready status of subscriptions
  var errorMetaLoaded = errorMetaSubs.ready();

  var hbarData = [];
  var isInLiveMode = this.get("isInLiveMode");

  var countMax = this.getMaxValue(data, "count");
  data.forEach(function (d) {
    var obj = {
      id: CryptoJS.MD5(d._id.name + "-" + d.type).toString(),
      errorName: d._id.name,
      count: d.count,
      type: d.type,
      pCount: self.getPct(d.count, countMax),
      status: d.status
    };
    if(d.lastSeenTime) {
      if(isInLiveMode){
        obj.lastSeenTime = moment(d.lastSeenTime).fromNow();
      } else {
        obj.lastSeenTime = moment(d.lastSeenTime).format("MMM Do HH:mm");
      }
    }

    // get the status from ErrorMeta collection if all the subscriptions are
    // loaded
    if(errorMetaLoaded) {
      obj.status = self.getStatus(obj);
    }

    // If the status became ignored via the subscription, we need to hide it.
    if(!self.get("showIgnored") && obj.status === "ignored") {
      return;
    }

    // if the error's status changed, we need to remove it from hbar
    var currentStatus = self.get("currentStatus");
    if(currentStatus !== "all" && obj.status !== currentStatus) {
      return;
    }

    hbarData.push(obj);
  });

  this.hbarChartData = hbarData;

  return hbarData;
};

component.prototype.getMaxValue = function(data, key) {
  var valueMax = _.max(data, function(obj){
    return obj[key];
  });
  return valueMax[key];
};

component.prototype.getPct = function(value, maxValue) {
  return (value / maxValue) * 100;
};

component.prototype.getStatus = function(obj) {
  var query = {name: obj.errorName, type: obj.type};
  var errorMeta = ErrorsMeta.findOne(query) || {};
  // if error is not found in the collection it is because 
  // 1. client didnt receive it yet
  // 2. it is a new error
  // 1 is handled by checking for subscription ready
  errorMeta.status = errorMeta.status || "new";
  return errorMeta.status;
};

component.state.isHbarChartLoading = function() {
  return !this.kdMetrics("breakdown").ready();
};

component.prototype.selectedErrorInfo = function() {
  var hbarData = this.get("hbarChartData") || [];
  var selection = FlowRouter.getQueryParam("selection");
  var selectionInfo;
  for (var i = hbarData.length - 1; i >= 0; i--) {
    if(hbarData[i].id === selection){
      selectionInfo = hbarData[i];
      break;
    }
  }

  // user has selected an error but
  // error info is not available during selecte time range
  if(selection && !selectionInfo){
    selectionInfo = {};
    selectionInfo.errorName = null;
  }
  return selectionInfo;
};

component.state.extraArgs = function() {
  var args = {};
  var selectionInfo = this.selectedErrorInfo() || {};
  // errorName can be "" or null
  if(selectionInfo.errorName !== undefined){
    args.selection = selectionInfo.errorName;
  }

  var errorType = selectionInfo.type || FlowRouter.getQueryParam("traceType");
  if(errorType){
    args.errorType = errorType;
  }
  var searchq = FlowRouter.getQueryParam("searchq");
  if(searchq){
    args.searchq = searchq;
  }

  var status = FlowRouter.getQueryParam("status") || "all";
  args.status = status;

  args.showIgnored = this.get("showIgnored");
  return args;
};

component.state.isSubsLoading = function() {
  return !errorMetaSubs.ready();
};

component.state.isFilteredByStatus = function() {
  var extraArgs = this.get("extraArgs");
  return !!extraArgs.status && extraArgs.status !== "all";
};

component.state.isErrorTrackingOn = function() {
  var appId = FlowRouter.getParam("appId");
  var app = Apps.findOne({_id: appId, initialErrorsReceived: {$exists: true}});
  return !!app;
};

component.state.showIgnored = function() {
  var status = FlowRouter.getQueryParam("status");
  if(status === "ignored") {
    return true;
  }
  var showIgnored = FlowRouter.getQueryParam("showIgnored");
  showIgnored = showIgnored === "true" ? true : false;
  return showIgnored;
};

component.state.currentStatus = function() {
  var status = FlowRouter.getQueryParam("status") || "all";
  return status;
};

component.action.showIgnoredErrors = function(showIgnoredErrors) {
  var canUseErrorStatus = this.checkPermissionsForStatus();
  if(canUseErrorStatus){
    FlowRouter.setQueryParams({showIgnored: showIgnoredErrors});
  }
  return new Promise(function(resolve) {
    resolve(canUseErrorStatus);
  });
  
};

component.action.changeCurrentErrorStatus = function(status) {
  var appId = FlowRouter.getParam("appId");
  var extraArgs = this.get("extraArgs");
  var errorName = extraArgs.selection;
  var errorType = extraArgs.errorType;

  var currentStatus = this.get("currentStatus");
  var showIgnored = this.get("showIgnored");

  var removeSelection = 
    !showIgnored && status === "ignored" ||
    currentStatus !== "all";

  if(removeSelection) {
    FlowRouter.setQueryParams({selection: null});
  }

  var afterChanged = function(err) {
    if(err) {
      var message = "Error changing status: " + (err.reason || err.message);
      growlAlert.error(message);
      // if there's an error, I need to bring back the selection again
      FlowRouter.setQueryParams({selection: errorName});
    }
  };
  var canUseErrorStatus = this.checkPermissionsForStatus();
  if(canUseErrorStatus){
    Meteor.call(
      "errorsMeta.changeState", appId, errorName, 
      errorType, status, afterChanged
    );
  }
};

component.prototype.checkPermissionsForStatus = function() {
  var appId = FlowRouter.getParam("appId");
  var plan = Utils.getPlanForTheApp(appId);
  var hasPermissions = PlansManager.allowFeature("errorStatus", plan);
  if(hasPermissions){
    return true;
  } else {
    var params = {"denied": "errorStatus", showIgnored: null, status: null};
    FlowRouter.setQueryParams(params);
    return false;
  }
};

component.prototype.resetSelection = function() {
  FlowRouter.setQueryParams({selection: null});
};

component.prototype.initAffix = function (){
  var fixWidth = this.fixHbarWidth.bind(this);
  this.fixWidthHandler = fixWidth;
  var fixHeight = this.fixHbarHeight.bind(this);
  this.fixHeightHandler = fixHeight;

  $(window).resize(fixWidth);
  $(window).resize(fixHeight);

  this.$(".hbar-wrap").on("affixed.bs.affix", fixWidth);
  this.$(".hbar-wrap").on("affixed.bs.affix", fixHeight);

  this.$(".hbar-wrap").on("affixed-top.bs.affix", fixWidth);
  this.$(".hbar-wrap").on("affixed-top.bs.affix", fixHeight);

  this.$(".hbar-wrap").affix({
    offset: {
      top: 165
    }
  });
};

component.prototype.fixHbarWidth = function() {
  var width = this.$(".hbar-wrap").parent().width();
  this.$(".hbar-wrap").width(width);
};

component.prototype.fixHbarHeight = function() {
  var height = $(window).height();
  this.$(".hbar-wrap.affix-top .list-group").height(height - 310);
  this.$(".hbar-wrap.affix .list-group").height(height - 100);
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);