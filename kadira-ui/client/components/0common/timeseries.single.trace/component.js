var component = FlowComponents.define("timeseries.single.trace",
function(props) {

  this.traceListDataKey = props.traceListDataKey;
  this.histogramDataKey = props.histogramDataKey;
  this.extraArgsFn = props.extraArgsFn;

  // for the timechart
  this.set("metricDataKey", props.metricDataKey);
  this.set("metric", props.metric);
  this.set("label", props.label);
  this.set("title", props.title);
  this.set("helperId", props.helperId);
  this.set("type", props.type);
  this.set("color", props.color);
  this.set("isHostsChart", props.isHostsChart);
  this.setFn("extraArgs", props.extraArgsFn);

  // for the distribution chart
  this.set("traceType", props.traceType);
  this.set("traceListDataKey", props.traceListDataKey);
  this.set("histogramDataKey", props.histogramDataKey);
  this.autorun(function() { 
    // set URL related args
    var urlArgs = this.getArgs();
    var selection = this.getSelectionArg();

    this.set("appId", urlArgs.appId);
    this.set("range", urlArgs.range);
    this.set("host", urlArgs.host);
    this.set("selection", selection);
  });

  // reset selectedTime if date range changed
  this.autorun(function() {
    // to rerun this function when date param changed we need this line
    FlowRouter.getQueryParam("date");
    this.set("selectedTime", null);
  });
});

component.action.setSelectedTime = function(x) {
  var alreadySelected = this.get("selectedTime") === x;
  if(alreadySelected) {
    this.set("selectedTime", null);
  } else {
    this.set("selectedTime", x);
  }
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.UiHelpers);
component.extend(Mixins.traceExplorer);
component.extend(Mixins.Params);
