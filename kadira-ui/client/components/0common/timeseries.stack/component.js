var component = FlowComponents.define("timeseries.stack", function(props) {
  this.props = props;

  this.set("title", props.title);
  this.set("helperId", props.helperId);
  this.set("isHostsChart", props.isHostsChart);
  this.set("colors", props.colors);

  this.autorun(function() {
    var args = this.getArgs(props);
    var extraArgs = props.extraArgsFn();
    args = _.extend(args, extraArgs);
    this.kdFindMetrics("timeseriesStack", this.props.metricDataKey, args);
  });
});

component.state.chartData = function() {
  var data = this.kdMetrics("timeseriesStack").fetch() || [];
  var metrics = this.props.metrics.trim().split(",");
  var labels = this.props.labels.split(",");
  var colors = this.props.colors.split(",");

  var timeSeriesPayload = [];

  metrics.forEach(function(metric, k) {
    var seriesData = [];
    data.forEach(function(item) {
      var timestamp = item._id.time.getTime();
      var value = item[metric];
      seriesData.push([timestamp, value]);
    });

    var name = labels[k];
    var color = colors[k];
    timeSeriesPayload.push({name: name, data: seriesData, color: color});
  });

  return timeSeriesPayload;
};

component.state.isChartLoading = function() {
  return !this.kdMetrics("timeseriesStack").ready();
};

component.action.notifySelectedTimeChange = function(x) {
  if(this.props.onChartClick){
    this.props.onChartClick(x);
  }
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);
component.extend(Mixins.CurrentChartTime);
