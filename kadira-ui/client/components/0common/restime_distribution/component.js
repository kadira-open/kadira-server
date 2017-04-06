var component =
FlowComponents.define("restimeDistribution", function(props) {
  this.traceListDataKey = props.traceListDataKey;
  this.histogramDataKey = props.histogramDataKey;

  this.extraArgsFn = props.extraArgsFn;
  this.selectedTimeFn = props.selectedTimeFn;
  this.appIdFn = props.appIdFn;
  this.rangeFn = props.rangeFn;
  this.hostFn = props.hostFn;
  this.selectionFn = props.selectionFn;
  this.set("traceType", props.traceType);

  this.autorun(function() {
    var selectedTime = this.selectedTimeFn();
    this.set("selectedTime", selectedTime);
    if(selectedTime) {
      this.loadTraces(selectedTime);
      this.loadResTimeDistribution(selectedTime);
    }
  });
});

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.traceExplorer);
component.extend(Mixins.UiHelpers);
component.extend(Mixins.upgradeNotifier);

component.prototype.loadTraces = function(selectedTime, extraArgs) {
  extraArgs = extraArgs || {};
  var args = {
    range: this.rangeFn(),
    time: new Date(selectedTime),
    appId: this.appIdFn(),
    host: this.hostFn(),
    selection: this.selectionFn()
  };
  _.extend(args, extraArgs);

  this.kdFindTraces("traceList", this.traceListDataKey, args);
};

component.prototype.loadResTimeDistribution = function(selectedTime) {
  var appId = this.appIdFn();
  var range = this.rangeFn();
  if(this.histogramDataKey) {
    var args = {
      time: new Date(selectedTime),
      host: this.hostFn(),
      appId: appId,
      range: range,
      selection: this.selectionFn()
    };

    this.kdFindMetrics("histogram", this.histogramDataKey, args);
  }
};

component.state.selectedTraces = function() {
  var handle = this.kdTraces("traceList");
  if(handle.error()) {
    console.log("traceList error:", handle.error());
  } else if(handle.ready()) {
    var traces = handle.fetch() || [];
    return traces;
  } else {
    return false;
  }
};

component.state.isTracesLoading = function() {
  var isSelectedTime = !!this.selectedTimeFn();
  return isSelectedTime && !this.kdTraces("traceList").ready();
};

component.state.prettifiedTraceDate = function () {
  var traceDate = this.selectedTimeFn();
  return this.prettifyDate(traceDate);
};

component.state.isHistogramLoading = function() {
  return !this.kdMetrics("histogram").ready();
};

component.state.histogramData = function() {
  // This is a HistoUtils compatible histogram
  // See: https://github.com/meteorhacks/node-histo-utils
  var histogram = {
    bins: [],
    binSize: 100
  };

  var handle = this.kdMetrics("histogram");

  if(handle.ready()) {
    _.each(handle.fetch(), function(point) {
      histogram.bins.push([point._id, point.count]);
    });
  }

  return histogram;
};

component.action.loadTracesForBin = function(bin) {
  var selectedTime = this.selectedTimeFn();
  var extraArgs = {};
  // This is to support querying traces for the histogram
  // We don't try to find to the correct histogram bin
  // Instead we try to find data grater than the given bin
  extraArgs.from = bin[0];
  this.loadTraces(selectedTime, extraArgs);
};

component.prototype.isResTimeDistributionAllowed = function() {
  var appId = this.appIdFn();
  var plan = Utils.getPlanForTheApp(appId);
  return PlansManager.allowFeature("resTimeDistribution", plan);
};

component.state.isResTimeDistributionAllowed = function() {
  return this.isResTimeDistributionAllowed();
};

component.extend(Mixins.upgradeNotifier);
