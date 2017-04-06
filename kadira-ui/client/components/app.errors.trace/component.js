var component = FlowComponents.define("app.errors.trace", function(props) {

  this.traceListDataKey = props.traceListDataKey;
  this.traceSampleDataKey = props.traceSampleDataKey;
  this.set("metricDataKey", props.metricDataKey);
  this.set("metric", props.metric);
  this.set("label", props.label);
  this.set("color", props.color);
  this.set("traceType", "errors");
  this.setFn("isStatusLoading", props.isStatusLoadingFn);

  this.setFn("extraArgs", props.extraArgsFn);
  var excludeArgs = ["host"];
  this.set("excludeArgs", excludeArgs);
  this.props = props;

  this.autorun(function() {
    // to rerun this function when date param changed we need this line
    FlowRouter.getQueryParam("date");
    // reset selectedTime if date range changed
    this.set("selectedTime", null);
  });

  this.autorun(function() {
    // if hbar selection changes we need to remove old sample trace
    // we need this lines to rerun this function
    // for every selection,date,res change
    FlowRouter.getQueryParam("selection");
    FlowRouter.getQueryParam("date");
    FlowRouter.getQueryParam("range");
    this.oldSampleTrace = null;
  });

  //get traces list
  this.autorun(function() {
    var extraArgs = props.extraArgsFn();
    var selectedTime = this.get("selectedTime");
    var appId = FlowRouter.getParam("appId");
    var range = this.getRange();
    if(selectedTime) {
      var args = {
        range: range,
        time: new Date(selectedTime),
        appId: appId
      };
      args = _.extend(args, extraArgs);
      this.kdFindTraces("traceList", this.traceListDataKey, args);
    }
  });

  //get sample traces
  this.autorun(function() {

    var extraArgs = props.extraArgsFn();
    var appId = FlowRouter.getParam("appId");
    var range = this.getRange();

    var dateQueryParam = FlowRouter.getQueryParam("date");
    //date cannot be empty for fetchTraces
    var date = parseInt(dateQueryParam) || Date.now();

    var args = {
      range: range,
      time: new Date(date),
      realtime: !dateQueryParam,
      appId: appId
    };
    args = _.extend(args, extraArgs);
    this.kdFindTraces("sampleTrace", this.traceSampleDataKey, args);
  });

  this.autorun(function() {
    var handle = this.kdTraces("sampleTrace");
    if(handle.ready()){
      var trace = handle.fetch() || [];
      var sample = trace[0];
      var isSameMethod = sample && this.oldSampleTrace &&
      (sample.name === this.oldSampleTrace.name) &&
      (sample.type === this.oldSampleTrace.type);

      var isNew  = sample && this.oldSampleTrace &&
      this.oldSampleTrace.startTime.getTime() < sample.startTime.getTime();

      if(!this.oldSampleTrace || !isSameMethod) {
        this.oldSampleTrace = sample;
        this.set("sampleTrace", sample);
      } else if(isSameMethod && isNew) {
        this.oldSampleTrace = sample;
        this.set("newSampleTrace", sample);
      }
    }

  });

  this.onRendered(function() {
    this.autorun(function() {
      var tab = FlowRouter.getQueryParam("errortab") || "sample";
      var tabElement;
      switch (tab){
      case "sample":
        tabElement = "em-inline-trace-exp";
        break;
      case "list":
        tabElement = "errors-chart";
        break;
      default:
        tabElement = "em-inline-trace-exp";
      }
      this.$("a[href=\"#"+ tabElement+ "\"]").tab("show");
    });
  });

});

component.state.selectedTraces = function() {
  var self = this;
  var handle = this.kdTraces("traceList");
  if(handle.ready()) {
    var traces = handle.fetch() || [];

    traces.forEach(function (trace) {
      trace.samples.forEach(function (sample) {
        sample.time = self.getTime(sample.time);
      });
    });
    this.set("isTracesLoading", false);
    return traces;
  } else {
    this.set("isTracesLoading", true);
    return false;
  }
};

component.state.isSampleTraceAvailable = function() {
  return !!this.get("sampleTrace");
};

component.state.isNewSampleTraceAvailable = function() {
  return !!this.get("newSampleTrace");
};

component.state.isSampleTracesLoading = function() {
  return !this.kdTraces("sampleTrace").ready();
};

component.state.isErrorSelected = function() {
  var selection = FlowRouter.getQueryParam("selection");
  return !!selection;
};

component.state.prettifiedTraceDate = function () {
  var traceDate = this.get("selectedTime");
  return this.prettifyDate(traceDate);
};

component.state.errorStatuses = function() {
  return ErrorStatuses;
};

component.state.currentStatus = function() {
  var appId = FlowRouter.getParam("appId");
  var extraArgs = this.get("extraArgs");
  var name = extraArgs.selection;
  var type = extraArgs.errorType;
  var query = {
    appId: appId, 
    name: name, 
    type: type
  };
  var errorsMeta = ErrorsMeta.findOne(query) || {};

  return errorsMeta.status || "new";
};

component.action.notifyStatusChange = function(status) {
  this.props.onCurrentErrorStatusChange = 
  this.props.onCurrentErrorStatusChange || function() {};
  this.props.onCurrentErrorStatusChange(status);
};

component.action.setSelectedTime = function(x) {
  var alreadySelected = this.get("selectedTime") === x;
  if(alreadySelected) {
    this.set("selectedTime", null);
  } else {
    this.set("selectedTime", x);
  }

  //go to traces list tab on chart click
  FlowRouter.setQueryParams({errortab: "list"});
};

component.action.showTraceExplorer = function(id) {
  FlowRouter.setQueryParams({explore: id, type: "errors"});
};

component.action.goToTab = function(tabPath) {
  FlowRouter.setQueryParams({errortab: tabPath});
};

component.action.loadNewSampleTrace = function() {
  var newSampleTrace = this.get("newSampleTrace");
  this.set("sampleTrace", newSampleTrace);
  this.oldSampleTrace = newSampleTrace;
  this.set("newSampleTrace", null);
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.UiHelpers);
component.extend(Mixins.traceExplorer);
component.extend(Mixins.Params);
