var component = FlowComponents.define("timeseries.stack.trace",
function(props) {

  this.traceListDataKey = props.traceListDataKey;
  this.set("metricDataKey", props.metricDataKey);
  this.set("metrics", props.metrics);
  this.set("labels", props.labels);
  this.set("title", props.title);
  this.set("helperId", props.helperId);
  this.set("traceType", props.traceType);

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