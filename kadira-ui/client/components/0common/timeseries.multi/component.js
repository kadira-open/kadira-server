var component = FlowComponents.define("timeseries.multi", function (props) {
  this.props = props;
  this.set("title", props.title);
  this.set("axisType", props.axisType || "multi");
  this.set("helperId", props.helperId);

  this.autorun(function() {
    var args = this.getArgs(props);
    if(props.metricDataKeys){
      var metricDataKeys = props.metricDataKeys || "";
      this.metricDataKeysArray = metricDataKeys.split(",");
    } else {
      this.metricDataKeysArray = [props.metricDataKey];
    }
    this.metricDataKeysArray.forEach((dataKey) => {
      this.kdFindMetrics("timeseriesMulti" + dataKey, dataKey, args);
    });
  });

});

component.state.chartData = function() {
  if(this.isChartLoading){
    return [];
  }
  var timeSeriesPayload = [];
  this.metricDataKeysArray.forEach((dataKey) => {
    var data = this.kdMetrics("timeseriesMulti" + dataKey).fetch() || [];
    var metrics = this.props.metrics.trim().split(",");
    var labels = this.props.labels.split(",");
    var colors = this.props.colors.split(",");

    metrics.forEach(function(metric, k) {
      var seriesData = [];
      data.forEach(function(item) {
        var timestamp = item._id.time.getTime();
        var value = item[metric];
        if(value !== undefined){
          seriesData.push([timestamp, value]);
        }
      });

      var name = labels[k];
      if(seriesData.length > 0){
        timeSeriesPayload.push({
          name: name,
          data: seriesData,
          color: colors[k]
        });
      }
    });
  });
  return timeSeriesPayload;
};

component.action.renderTooltip = function(name, value) {
  if(this.props.onTooltipFormat){
    var metrics = this.props.metrics.trim().split(",");
    var labels = this.props.labels.split(",");

    var idx = _.indexOf(labels, name);
    var metric = metrics[idx];
    return this.props.onTooltipFormat(metric, value);
  } else {
    return value;
  }
};

component.state.isChartLoading = function() {
  var isLoading = false;
  this.metricDataKeysArray.forEach((dataKey) => {
    var isFractionReady = this.kdMetrics("timeseriesMulti" + dataKey).ready();
    if(!isFractionReady) {
      isLoading = false;
    }
  });
  return isLoading;
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);
component.extend(Mixins.CurrentChartTime);
