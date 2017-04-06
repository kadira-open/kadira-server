import ColorHash from 'color-hash'
import CrcChecksum from 'crc'

var component = FlowComponents.define("timeseries.single", function(props) {
  this.metricDataKey = props.metricDataKey;

  this.colorHash = new ColorHash({hash: CrcChecksum.crc16});
  this.color = props.color;
  this.label = props.label;
  this.metric = props.metric;
  this.onChartClick = props.onChartClick;

  this.set("title", props.title);
  this.set("helperId", props.helperId);
  this.set("color", props.color);
  this.set("chartType", props.chartType || "area");

  this.autorun(function() {
    var args = this.getArgs(props);
    props.extraArgs = props.extraArgs || function() {};
    var extraArgs = props.extraArgs();
    args = _.extend(args, extraArgs);

    // exclude some args from query
    var excludeArgs = props.excludeArgs || [];
    excludeArgs.map(function(arg) {
      delete args[arg];
    });

    this.kdFindMetrics("timeseries", this.metricDataKey, args);
  });

  this.autorun(function() {
    var data = this.kdMetrics("timeseries").fetch() || [];
    this.processChartData(data);
  });
});

component.prototype.processChartData = function(rawData) {
  var self = this;
  var timeseries = [];
  rawData.forEach(function(item) {
    var timestamp = item._id.time.getTime();
    var value = item[self.metric];
    timeseries.push([timestamp, value]);
  });

  var timeSeriesPayload = [{name: self.label, data: timeseries}];
  var chartData = timeSeriesPayload;
  // set fireAway=true for avoid equality check for large object
  this.set("processedChartData", chartData, true);
};

component.action.setSelectedPoint = function(x, y) {
  if(this.onChartClick){
    this.onChartClick(x, y);
  }
  var currentPoint = this.get("selectedPoint") || [];
  if(currentPoint[0] === x && currentPoint[1] === y) {
    // unselect if it is already selected point
    this.set("selectedPoint", []);
  } else {
    this.set("selectedPoint", [x, y]);
    var seriesName = this.get("hoveredSeries");
    this.set("selectedSeries", seriesName);
  }
};

component.state.isChartLoading = function() {
  return !this.kdMetrics("timeseries").ready();
};

component.state.isDataEmpty = function() {
  var chartData = this.get("processedChartData") || [];
  var isChartLoading = this.get("isChartLoading");
  return !isChartLoading && chartData.length === 0;
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);
component.extend(Mixins.CurrentChartTime);
